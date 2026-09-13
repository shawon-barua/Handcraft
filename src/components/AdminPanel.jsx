/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Package, Settings, 
  DollarSign, TrendingUp, Clock, CheckCircle2, MessageSquare, 
  Edit3, Trash2, Plus, Save, Search, Filter, ExternalLink, Sparkles, RefreshCw, AlertCircle,
  Upload, Image as ImageIcon, Check, X, ArrowRight, ArrowDown, XCircle, ChevronRight, Phone, MapPin, Eye, EyeOff,
  ShieldCheck, Lock, Key, User, Users, ShieldAlert, UserCheck, History
} from 'lucide-react';

export default function AdminPanel({
  initialSettings,
  onRefreshData,
  currency = '৳',
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'categories' | 'products' | 'settings' | 'admins'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(initialSettings || {});
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Admin Team Management states (Super Admin exclusive)
  const [adminList, setAdminList] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [adminActionError, setAdminActionError] = useState('');
  const [adminActionSuccess, setAdminActionSuccess] = useState('');

  // Password Change & Reset states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // SuperAdmin direct reset state for another admin
  const [resetTargetAdmin, setResetTargetAdmin] = useState(null);
  const [adminResetNewPassword, setAdminResetNewPassword] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);

  // Filter & Search states
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Editing state for Special Notes
  const [editingNotes, setEditingNotes] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  // Forms state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: '', icon: 'Sparkles' });

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'seed-beads-jewellery',
    price: '',
    originalPrice: '',
    description: '',
    materials: '',
    stock: 15,
    image1: '',
    image2: '',
    image3: '',
    badges: ['Handcrafted']
  });

  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);

  const [settingsSaved, setSettingsSaved] = useState(false);

  // Authenticated fetch helper that automatically attaches JWT admin token
  const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('falguni_admin_token');
    const headers = {
      ...(options.headers || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return fetch(url, { ...options, headers });
  };

  // Fetch admin data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, catsRes, prodsRes, settingsRes] = await Promise.all([
        authFetch('/api/stats').then(r => r.json()),
        authFetch('/api/orders').then(r => r.json()),
        authFetch('/api/categories').then(r => r.json()),
        authFetch('/api/products').then(r => r.json()),
        authFetch('/api/settings').then(r => r.json())
      ]);

      setStats(statsRes);
      setOrders(ordersRes);
      setCategories(catsRes);
      setProducts(prodsRes);
      setSettings(settingsRes);

      // Initialize editing notes map
      const noteMap = {};
      ordersRes.forEach(o => {
        noteMap[o.id] = o.specialNote || '';
      });
      setEditingNotes(noteMap);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      const res = await authFetch('/api/auth/admins');
      if (res.ok) {
        const data = await res.json();
        setAdminList(data);
      }
    } catch (err) {
      console.error('Failed to load admin team list:', err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (currentUser?.role === 'superadmin') {
      fetchAdmins();
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'admins' && currentUser?.role === 'superadmin') {
      fetchAdmins();
    }
  }, [activeTab]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminActionError('');
    setAdminActionSuccess('');

    if (!newAdminData.name.trim() || !newAdminData.email.trim() || !newAdminData.password.trim()) {
      setAdminActionError('Please provide name, email, and initial password.');
      return;
    }

    try {
      const res = await authFetch('/api/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add administrator.');
      }

      setAdminActionSuccess(`Administrator '${data.admin.name}' successfully created.`);
      setNewAdminData({ name: '', email: '', password: '', role: 'admin' });
      setShowAddAdminModal(false);
      fetchAdmins();
    } catch (err) {
      setAdminActionError(err.message || 'Error creating administrator.');
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to remove administrator "${adminName}"? They will permanently lose access to the admin site.`)) {
      return;
    }

    setAdminActionError('');
    setAdminActionSuccess('');

    try {
      const res = await authFetch(`/api/auth/admins/${adminId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove administrator.');
      }

      setAdminActionSuccess(data.message || `Admin account removed.`);
      fetchAdmins();
    } catch (err) {
      setAdminActionError(err.message || 'Error removing administrator.');
    }
  };

  // Handle saving Special Note on an Order
  const handleSaveSpecialNote = async (orderId) => {
    const note = editingNotes[orderId] || '';
    setSaveStatus(prev => ({ ...prev, [orderId]: 'saving' }));
    const adminName = currentUser?.name || currentUser?.email || 'Admin';

    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          specialNote: note,
          noteUpdatedBy: adminName
        })
      });

      if (res.ok) {
        setSaveStatus(prev => ({ ...prev, [orderId]: 'saved' }));
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [orderId]: null }));
        }, 2000);
        // Refresh orders
        const updated = await authFetch('/api/orders').then(r => r.json());
        setOrders(updated);
      }
    } catch (err) {
      console.error('Failed to save special note:', err);
      setSaveStatus(prev => ({ ...prev, [orderId]: 'error' }));
    }
  };

  // Handle Order Status change
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    const adminName = currentUser?.name || currentUser?.email || 'Admin';

    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          updatedBy: adminName
        })
      });

      if (res.ok) {
        // Refresh orders and stats
        const [updatedOrders, updatedStats] = await Promise.all([
          authFetch('/api/orders').then(r => r.json()),
          authFetch('/api/stats').then(r => r.json())
        ]);
        setOrders(updatedOrders);
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle Delete Single Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to permanently delete order #${orderId}?`)) return;
    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const [updatedOrders, updatedStats] = await Promise.all([
          authFetch('/api/orders').then(r => r.json()),
          authFetch('/api/stats').then(r => r.json())
        ]);
        setOrders(Array.isArray(updatedOrders) ? updatedOrders : []);
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  // Handle Clear All Orders
  const handleClearAllOrders = async () => {
    if (!window.confirm('⚠️ Are you sure you want to permanently DELETE ALL ORDERS from the database? This cannot be undone.')) return;
    try {
      const res = await authFetch('/api/orders', {
        method: 'DELETE'
      });
      if (res.ok) {
        const [updatedOrders, updatedStats] = await Promise.all([
          authFetch('/api/orders').then(r => r.json()),
          authFetch('/api/stats').then(r => r.json())
        ]);
        setOrders(Array.isArray(updatedOrders) ? updatedOrders : []);
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Failed to clear orders:', err);
    }
  };

  // Handle Change Own Password
  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!passwordChangeData.currentPassword) {
      setPasswordChangeError('Please enter your current password.');
      return;
    }

    if (!passwordChangeData.newPassword || passwordChangeData.newPassword.trim().length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      setPasswordChangeError('New password and confirmation do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordChangeData.currentPassword,
          newPassword: passwordChangeData.newPassword.trim()
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        // Non-JSON response (e.g. 404 / 500 HTML)
      }

      if (!res.ok) {
        if (res.status === 404) {
          setPasswordChangeError('Endpoint not found (404). Please restart the Node.js app in cPanel Setup Node.js App.');
        } else {
          setPasswordChangeError(data.error || `Server error (${res.status}). Please try again.`);
        }
      } else {
        setPasswordChangeSuccess(data.message || 'Password changed successfully!');
        setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordChangeSuccess('');
        }, 2200);
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordChangeError('Network or connection error. Please verify server is reachable and try again.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Handle Reset Team Member Password (SuperAdmin only)
  const handleResetTeamMemberPassword = async (e) => {
    e.preventDefault();
    if (!resetTargetAdmin || !adminResetNewPassword || adminResetNewPassword.trim().length < 6) {
      setAdminActionError('New password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await authFetch('/api/auth/reset-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: resetTargetAdmin.id,
          newPassword: adminResetNewPassword.trim()
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        // Non-JSON response
      }

      if (!res.ok) {
        if (res.status === 404) {
          setAdminActionError('Endpoint not found (404). Please restart the Node.js app in cPanel.');
        } else {
          setAdminActionError(data.error || `Failed to reset password (${res.status}).`);
        }
      } else {
        setAdminActionSuccess(data.message || 'Password updated successfully!');
        setResetTargetAdmin(null);
        setAdminResetNewPassword('');
        setTimeout(() => setAdminActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setAdminActionError('Failed to reset password. Please check network connection.');
    }
  };

  // Handle Creating Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const res = await authFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (res.ok) {
        setShowAddCategoryModal(false);
        setNewCategory({ name: '', description: '', image: '', icon: 'Sparkles' });
        const cats = await authFetch('/api/categories').then(r => r.json());
        setCategories(cats);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  // Handle Deleting Category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await authFetch(`/api/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        const cats = await authFetch('/api/categories').then(r => r.json());
        setCategories(cats);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Handle Creating Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title.trim() || !newProduct.price) return;

    try {
      const imagesList = [newProduct.image1, newProduct.image2, newProduct.image3].filter(Boolean);
      const res = await authFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
          stock: Number(newProduct.stock),
          images: imagesList.length > 0 ? imagesList : undefined,
          image: imagesList[0] || undefined
        })
      });

      if (res.ok) {
        setShowAddProductModal(false);
        setNewProduct({
          title: '',
          category: categories[0]?.slug || 'seed-beads-jewellery',
          price: '',
          originalPrice: '',
          description: '',
          materials: '',
          stock: 15,
          image1: '',
          image2: '',
          image3: '',
          badges: ['Handcrafted']
        });
        const prods = await authFetch('/api/products').then(r => r.json());
        setProducts(prods);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  // Handle Deleting Product
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await authFetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        const prods = await authFetch('/api/products').then(r => r.json());
        setProducts(prods);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod) => {
    const images = prod.images && prod.images.length > 0
      ? prod.images
      : [prod.image || '', '', ''];

    setEditingProduct({
      id: prod.id,
      title: prod.title || '',
      category: prod.category || 'seed-beads-jewellery',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      description: prod.description || '',
      materials: prod.materials || '',
      stock: prod.stock !== undefined ? prod.stock : 10,
      image1: images[0] || '',
      image2: images[1] || '',
      image3: images[2] || '',
      badges: prod.badges || ['Handcrafted']
    });
    setShowEditProductModal(true);
  };

  // Save / Update Existing Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.title.trim() || !editingProduct.price) return;

    try {
      const imagesList = [editingProduct.image1, editingProduct.image2, editingProduct.image3].filter(Boolean);
      const res = await authFetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price),
          originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
          stock: Number(editingProduct.stock),
          images: imagesList.length > 0 ? imagesList : undefined,
          image: imagesList[0] || undefined
        })
      });

      if (res.ok) {
        setShowEditProductModal(false);
        setEditingProduct(null);
        const prods = await authFetch('/api/products').then(r => r.json());
        setProducts(prods);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  // Handle direct image file upload to server
  const handleUploadImageFile = async (file, target, fieldName) => {
    if (!file) return;
    const key = `${target}-${fieldName}`;
    setUploadingKey(key);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result;
          const res = await authFetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              filename: file.name
            })
          });
          const data = await res.json();
          if (data.url) {
            if (target === 'new') {
              setNewProduct(prev => ({ ...prev, [fieldName]: data.url }));
            } else if (target === 'edit') {
              setEditingProduct(prev => ({ ...prev, [fieldName]: data.url }));
            } else if (target === 'category') {
              setNewCategory(prev => ({ ...prev, [fieldName]: data.url }));
            }
          } else {
            alert('Upload failed: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          console.error('Error uploading file:', err);
          alert('Upload failed: ' + err.message);
        } finally {
          setUploadingKey(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('FileReader error:', err);
      setUploadingKey(null);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    let matchesStatus = true;
    if (orderStatusFilter === 'Confirmed Sales' || orderStatusFilter === 'Confirmed') {
      matchesStatus = o.status === 'Confirmed' || o.status === 'Confirmed Sales';
    } else if (orderStatusFilter === 'Active Negotiation' || orderStatusFilter === 'In Negotiation') {
      matchesStatus = o.status === 'In Negotiation' || o.status === 'Active Negotiation';
    } else if (orderStatusFilter !== 'all') {
      matchesStatus = o.status === orderStatusFilter;
    }
    const q = orderSearch.toLowerCase();
    const matchesSearch = !orderSearch || 
      o.id.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.customer?.address?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '2rem 0', minHeight: '85vh' }}>
      <div className="container">
        {/* Admin Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.8rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold" style={{ color: '#c0520d', borderColor: '#fed7aa', background: '#fff7ed' }}>Artisan Portal</span>
              <span style={{ fontSize: '0.8rem', color: '#78716c' }}>Backend Management & Analytics</span>
              {currentUser && (
                <span style={{
                  fontSize: '0.75rem',
                  background: currentUser.role === 'superadmin' ? '#fff7ed' : '#eff6ff',
                  color: currentUser.role === 'superadmin' ? '#c0520d' : '#1d4ed8',
                  border: `1px solid ${currentUser.role === 'superadmin' ? '#fed7aa' : '#bfdbfe'}`,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={13} />
                  {currentUser.role === 'superadmin' ? 'Super Admin' : 'Standard Admin'} ({currentUser.name || currentUser.email})
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', color: '#1c1917', marginTop: '0.2rem' }}>
              Store Administration
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordChangeError('');
                setPasswordChangeSuccess('');
                setShowPasswordModal(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                borderColor: '#fed7aa',
                color: '#c0520d',
                fontWeight: 700
              }}
              title="Change your admin password"
            >
              <Key size={14} /> Change Password
            </button>
            <button
              onClick={fetchData}
              className="btn btn-secondary btn-sm"
              title="Refresh Data"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '0.5rem'
        }}>
          {[
            { id: 'dashboard', label: 'Overview & Stats', icon: LayoutDashboard },
            { id: 'orders', label: `Customer Orders & Carts (${orders.length})`, icon: ShoppingBag },
            { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'settings', label: 'Store Settings', icon: Settings },
            ...(currentUser?.role === 'superadmin' ? [
              { id: 'admins', label: `Admin Team (${adminList.length})`, icon: ShieldCheck }
            ] : [])
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? '#e26d21' : '#ffffff',
                  color: isActive ? '#ffffff' : '#44403c',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid #e26d21' : '1px solid #e7e2db',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  transition: 'var(--transition)',
                  boxShadow: isActive ? '0 2px 8px rgba(226, 109, 33, 0.25)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD & STATS                                      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Cards Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              {/* Total Orders - Card (Scrolls to Inquiries section below) */}
              <div
                onClick={() => {
                  document.getElementById('customer-inquiries-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #e7e2db',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#e26d21';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(226, 109, 33, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e7e2db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                title="View Customer Inquiries & Order Actions below"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Inquiries / Orders</span>
                  <ShoppingBag size={18} color="#e26d21" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1c1917' }}>
                  {stats?.totalOrders ?? 0}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 500 }}>
                    Via WhatsApp & Email
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#e26d21',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    Actions Below <ArrowDown size={13} />
                  </span>
                </div>
              </div>

              {/* Total Sales - Card (Navigates to Orders tab with Confirmed Sales filter) */}
              <div
                onClick={() => {
                  setOrderStatusFilter('Confirmed Sales');
                  setActiveTab('orders');
                }}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #e7e2db',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#15803d';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(21, 128, 61, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e7e2db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                title="Manage confirmed sales in Customer Orders tab"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Confirmed Sales</span>
                  <DollarSign size={18} color="#15803d" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#c0520d' }}>
                  {currency} {(stats?.totalSale ?? 0).toLocaleString()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#78716c' }}>
                    {orders.filter(o => o.status === 'Confirmed' || o.status === 'Confirmed Sales').length} Confirmed
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#15803d',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    Manage Orders <ArrowRight size={13} />
                  </span>
                </div>
              </div>

              {/* In Negotiation - Card (Navigates to Orders tab with Active Negotiation filter) */}
              <div
                onClick={() => {
                  setOrderStatusFilter('Active Negotiation');
                  setActiveTab('orders');
                }}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #e7e2db',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e7e2db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                title="Review active negotiations in Customer Orders tab"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>In Active Negotiation</span>
                  <MessageSquare size={18} color="#2563eb" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2563eb' }}>
                  {stats?.inNegotiationCount ?? 0}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#78716c' }}>
                    Potential: {currency} {(stats?.potentialNegotiationSale ?? 0).toLocaleString()}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#2563eb',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    Review Orders <ArrowRight size={13} />
                  </span>
                </div>
              </div>

              {/* Active Products */}
              <div
                onClick={() => setActiveTab('products')}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid #e7e2db',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e7e2db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Catalog Inventory</span>
                  <Package size={18} color="#7c3aed" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1c1917' }}>
                  {stats?.totalProducts ?? 0}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#78716c' }}>
                    Across {stats?.totalCategories ?? 0} artisan categories
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#7c3aed',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    Inventory <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Inquiries / Orders Management Section on Dashboard */}
            <div id="customer-inquiries-section" className="glass-panel" style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #e7e2db',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.2rem',
                flexWrap: 'wrap',
                gap: '0.8rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: '#1c1917', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={20} color="#e26d21" /> Customer Inquiries & Order Actions
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#78716c', marginTop: '0.2rem' }}>
                    Click status buttons below to immediately confirm sales, continue active negotiation, or cancel inquiries.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {orders.length > 0 && (
                    <button
                      onClick={handleClearAllOrders}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        padding: '0.42rem 0.8rem',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Clear all orders before hosting"
                    >
                      <Trash2 size={13} /> Clear Orders
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  >
                    Customer Orders Tab ({orders.length}) <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Inquiries / Orders List */}
              {orders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c' }}>
                  <ShoppingBag size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p>No customer inquiries or orders received yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map(order => {
                    const customerWhatsApp = order.customer?.phone?.replace(/[^0-9]/g, '');
                    const waChatUrl = `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(`Hello ${order.customer?.name}! This is ${settings?.storeName || 'Falguni Handcraft'} regarding your order #${order.id}.`)}`;
                    const isUpdating = updatingOrderId === order.id;

                    return (
                      <div
                        key={order.id}
                        style={{
                          padding: '1.15rem 1.25rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #e7e2db',
                          background: '#faf8f5',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem'
                        }}
                      >
                        {/* Order Header */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.6rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#1c1917' }}>
                              #{order.id}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#78716c' }}>
                              {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`badge ${order.channel === 'whatsapp' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                              Via {order.channel?.toUpperCase()}
                            </span>
                          </div>

                          {/* Status Badge & Admin Marker */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              background: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '#dcfce7' :
                                          (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '#ffedd5' :
                                          order.status === 'Cancelled' ? '#fee2e2' : '#f3f4f6',
                              color: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '#15803d' :
                                     (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '#c0520d' :
                                     order.status === 'Cancelled' ? '#dc2626' : '#4b5563',
                              border: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '1px solid #bbf7d0' :
                                      (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '1px solid #fed7aa' :
                                      order.status === 'Cancelled' ? '1px solid #fecaca' : '1px solid #e5e7eb'
                            }}>
                              {(order.status === 'Confirmed' || order.status === 'Confirmed Sales') && <CheckCircle2 size={12} />}
                              {(order.status === 'In Negotiation' || order.status === 'Active Negotiation') && <MessageSquare size={12} />}
                              {order.status === 'Cancelled' && <XCircle size={12} />}
                              {(order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? 'Confirmed Sales' :
                               (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? 'Active Negotiation' :
                               order.status}
                            </span>

                            {/* Marked By Admin Marker */}
                            {order.statusUpdatedBy && (
                              <span 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.22rem 0.6rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1.5px solid #bfdbfe',
                                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)'
                                }}
                                title={`Status updated by ${order.statusUpdatedBy}${order.statusUpdatedAt ? ' on ' + new Date(order.statusUpdatedAt).toLocaleString() : ''}`}
                              >
                                <UserCheck size={12} color="#2563eb" />
                                <span>Marked by: <strong>{order.statusUpdatedBy}</strong></span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Details: Customer & Items */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '1rem',
                          background: '#ffffff',
                          padding: '0.9rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #ede8e1'
                        }}>
                          {/* Customer */}
                          <div>
                            <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: '#78716c', fontWeight: 700, marginBottom: '0.3rem' }}>
                              Customer Information
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1c1917' }}>
                              {order.customer?.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#57534e', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{order.customer?.phone}</span>
                              {customerWhatsApp && (
                                <a
                                  href={waChatUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    color: '#15803d',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textDecoration: 'none'
                                  }}
                                  title="Open WhatsApp chat"
                                >
                                  <MessageSquare size={11} /> WhatsApp
                                </a>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.2rem' }}>
                              {order.customer?.address}{order.customer?.city ? `, ${order.customer?.city}` : ''}
                            </div>
                            {order.customer?.notes && (
                              <div style={{ fontSize: '0.76rem', color: '#c2410c', marginTop: '0.3rem', fontStyle: 'italic' }}>
                                "{order.customer.notes}"
                              </div>
                            )}
                          </div>

                          {/* Items Summary */}
                          <div>
                            <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: '#78716c', fontWeight: 700, marginBottom: '0.3rem' }}>
                              Ordered Items ({order.items?.length || 0})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '70px', overflowY: 'auto' }}>
                              {order.items?.map((item, i) => (
                                <div key={i} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', color: '#44403c', alignItems: 'center' }}>
                                  <a 
                                    href={`/?product=${encodeURIComponent(item.id)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap', 
                                      maxWidth: '70%',
                                      color: '#c0520d',
                                      textDecoration: 'underline',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                    title="Click to view product on storefront in new tab"
                                  >
                                    🔗 {item.title} × {item.quantity || 1}
                                  </a>
                                  <span style={{ fontWeight: 600 }}>
                                    {currency} {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div style={{
                              borderTop: '1px dashed #e7e2db',
                              marginTop: '0.4rem',
                              paddingTop: '0.3rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              color: '#c0520d'
                            }}>
                              <span>Total Amount:</span>
                              <span>{currency} {(Number(order.totalAmount) || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Confirmed Sales, Active Negotiation, Cancelled */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.6rem',
                          paddingTop: '0.2rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#57534e' }}>
                              Mark Status:
                            </span>

                            {/* 1. Confirmed Sales */}
                            <button
                              onClick={() => handleStatusChange(order.id, 'Confirmed Sales')}
                              disabled={isUpdating}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: isUpdating ? 'wait' : 'pointer',
                                transition: 'all 0.18s ease',
                                background: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '#15803d' : '#ffffff',
                                color: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '#ffffff' : '#15803d',
                                border: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '1px solid #15803d' : '1px solid #86efac',
                                boxShadow: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none'
                              }}
                            >
                              <CheckCircle2 size={13} />
                              Confirmed Sales
                            </button>

                            {/* 2. Active Negotiation */}
                            <button
                              onClick={() => handleStatusChange(order.id, 'Active Negotiation')}
                              disabled={isUpdating}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: isUpdating ? 'wait' : 'pointer',
                                transition: 'all 0.18s ease',
                                background: (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '#e26d21' : '#ffffff',
                                color: (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '#ffffff' : '#c0520d',
                                border: (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '1px solid #e26d21' : '1px solid #fed7aa',
                                boxShadow: (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '0 2px 6px rgba(226, 109, 33, 0.25)' : 'none'
                              }}
                            >
                              <MessageSquare size={13} />
                              Active Negotiation
                            </button>

                            {/* 3. Cancelled */}
                            <button
                              onClick={() => handleStatusChange(order.id, 'Cancelled')}
                              disabled={isUpdating}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: isUpdating ? 'wait' : 'pointer',
                                transition: 'all 0.18s ease',
                                background: order.status === 'Cancelled' ? '#dc2626' : '#ffffff',
                                color: order.status === 'Cancelled' ? '#ffffff' : '#dc2626',
                                border: order.status === 'Cancelled' ? '1px solid #dc2626' : '1px solid #fecaca',
                                boxShadow: order.status === 'Cancelled' ? '0 2px 6px rgba(220, 38, 38, 0.25)' : 'none'
                              }}
                            >
                              <XCircle size={13} />
                              Cancelled
                            </button>
                          </div>

                          {/* Extra Status Select */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.74rem', color: '#78716c' }}>Lifecycle:</span>
                            <select
                              value={
                                (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? 'Confirmed Sales' :
                                (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? 'Active Negotiation' :
                                order.status === 'Cancelled' ? 'Cancelled' : 'Active Negotiation'
                              }
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={isUpdating}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                background: '#ffffff',
                                border: '1px solid #d6d0c7',
                                color: '#44403c',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Active Negotiation">Active Negotiation</option>
                              <option value="Confirmed Sales">Confirmed Sales</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.3rem 0.55rem',
                                borderRadius: 'var(--radius-sm)',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Delete this order"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                            {isUpdating && <RefreshCw size={13} className="spin" color="#e26d21" />}
                          </div>
                        </div>

                        {/* Status Marker & History */}
                        {order.statusUpdatedBy && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.4rem',
                            padding: '0.4rem 0.65rem',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.76rem',
                            marginTop: '0.2rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                              <UserCheck size={13} color="#2563eb" />
                              <span>Status updated by: <strong style={{ color: '#1d4ed8' }}>{order.statusUpdatedBy}</strong></span>
                              {order.statusUpdatedAt && (
                                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                  ({new Date(order.statusUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(order.statusUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                              )}
                            </div>

                            {Array.isArray(order.statusHistory) && order.statusHistory.length > 1 && (
                              <span 
                                style={{ 
                                  fontSize: '0.72rem', 
                                  color: '#64748b',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  background: '#fff',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1'
                                }}
                                title={order.statusHistory.map(h => `${h.status} by ${h.changedBy || 'Admin'} (${new Date(h.at).toLocaleDateString()})`).join(' ➔ ')}
                              >
                                <History size={11} />
                                {order.statusHistory.length} status logs
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Performance Breakdown */}
            <div className="glass-panel" style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #e7e2db',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1c1917' }}>
                Category Distribution & Catalog Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {(stats?.categoryStats || []).map((cat, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#faf8f5',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #e7e2db'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#1c1917', fontSize: '0.95rem' }}>{cat.name}</strong>
                      <span className="badge badge-gold">{cat.productCount} Items</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#78716c' }}>
                      Total items ordered: <span style={{ color: '#c0520d', fontWeight: 600 }}>{cat.ordersItemCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: CUSTOMER ORDERS & CARTS (WITH SPECIAL NOTES)           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters and search */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: '#1c1917', fontWeight: 700 }}>Filter Status:</span>
                {['all', 'Active Negotiation', 'Confirmed Sales', 'Cancelled', 'Inquiry'].map(status => {
                  const isSelected = orderStatusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 700 : 600,
                        border: isSelected ? '1.5px solid #1d4ed8' : '1px solid #bfdbfe',
                        background: isSelected ? '#2563eb' : '#eff6ff',
                        color: isSelected ? '#ffffff' : '#1d4ed8',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {status === 'all' ? 'All Orders' : status}
                    </button>
                  );
                })}
              </div>

              {/* Order Search & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {orders.length > 0 && (
                  <button
                    onClick={handleClearAllOrders}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="Permanently wipe all orders before hosting"
                  >
                    <Trash2 size={13} /> Clear All Orders
                  </button>
                )}
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search customer, phone, ID..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="form-input"
                    style={{ padding: '0.45rem 0.8rem 0.45rem 2.2rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No orders match your search or filter</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredOrders.map(order => {
                  const customerWhatsApp = order.customer?.phone?.replace(/[^0-9]/g, '');
                  const waChatUrl = `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(`Hello ${order.customer?.name}! This is ${settings?.storeName || 'Falguni Handcraft'} regarding your order #${order.id}.`)}`;

                  return (
                    <div
                      key={order.id}
                      style={{
                        padding: '1.5rem',
                        background: '#ffffff',
                        border: '1px solid #e7e2db',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? '4px solid #15803d' :
                                    (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? '4px solid #e26d21' :
                                    '4px solid #dc2626'
                      }}
                    >
                      {/* Top Row: Ref ID, Status, Channel, Date */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.8rem',
                        marginBottom: '1rem',
                        borderBottom: '1px solid #e7e2db',
                        paddingBottom: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1c1917' }}>
                            #{order.id}
                          </span>
                          <span className={`badge ${order.channel === 'whatsapp' ? 'badge-green' : 'badge-gold'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MessageSquare size={12} /> Via {order.channel?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#78716c' }}>
                            {new Date(order.orderDate).toLocaleString()}
                          </span>

                          {/* Admin Marker Badge */}
                          {order.statusUpdatedBy && (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.22rem 0.65rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1.5px solid #bfdbfe',
                                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.12)'
                              }}
                              title={`Status marked by ${order.statusUpdatedBy}${order.statusUpdatedAt ? ' on ' + new Date(order.statusUpdatedAt).toLocaleString() : ''}`}
                            >
                              <UserCheck size={13} color="#2563eb" />
                              <span>Marked by: <strong style={{ textDecoration: 'underline' }}>{order.statusUpdatedBy}</strong></span>
                            </span>
                          )}
                        </div>

                        {/* Status Switcher & Last Updated Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Order Status:</span>
                            <select
                              value={
                                (order.status === 'Confirmed' || order.status === 'Confirmed Sales') ? 'Confirmed Sales' :
                                (order.status === 'In Negotiation' || order.status === 'Active Negotiation') ? 'Active Negotiation' :
                                order.status === 'Cancelled' ? 'Cancelled' : 'Active Negotiation'
                              }
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: 'var(--radius-sm)',
                                background: '#faf8f5',
                                border: '1px solid #d6d0c7',
                                color: '#c0520d',
                                fontWeight: 700,
                                fontSize: '0.85rem'
                              }}
                            >
                              <option value="Active Negotiation">Active Negotiation</option>
                              <option value="Confirmed Sales">Confirmed Sales</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.4rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}
                              title="Delete this order"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>

                          {order.statusUpdatedBy && (
                            <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span>Status updated by: <strong style={{ color: '#1d4ed8' }}>{order.statusUpdatedBy}</strong></span>
                              {order.statusUpdatedAt && (
                                <span>• {new Date(order.statusUpdatedAt).toLocaleDateString()} at {new Date(order.statusUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Order Content: Grid of Customer Info & Items */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '1.25rem'
                      }}>
                        {/* Customer Details Box */}
                        <div style={{
                          background: '#faf8f5',
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #e7e2db'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <h4 style={{ fontSize: '0.95rem', color: '#1c1917', fontWeight: 700 }}>Customer Details</h4>
                            {customerWhatsApp && (
                              <a
                                href={waChatUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              >
                                <MessageSquare size={12} /> Chat Customer
                              </a>
                            )}
                          </div>
                          <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#292524' }}>
                            <div><strong>Name:</strong> {order.customer?.name}</div>
                            <div><strong>Phone:</strong> {order.customer?.phone}</div>
                            <div><strong>Address:</strong> {order.customer?.address}, {order.customer?.city}</div>
                            {order.customer?.notes && (
                              <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                background: '#fff7ed',
                                borderRadius: '4px',
                                border: '1px dashed #fed7aa',
                                color: '#9a3412'
                              }}>
                                💬 <em>"{order.customer?.notes}"</em>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Customer Cart Items */}
                        <div style={{
                          background: '#faf8f5',
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #e7e2db'
                        }}>
                          <h4 style={{ fontSize: '0.95rem', color: '#1c1917', marginBottom: '0.6rem', fontWeight: 700 }}>
                            Cart Items ({order.items?.length || 0})
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '0.85rem',
                                  borderBottom: '1px dashed #e7e2db',
                                  paddingBottom: '0.35rem',
                                  color: '#292524'
                                }}
                              >
                                <a
                                  href={`/?product=${encodeURIComponent(item.id)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#c0520d',
                                    textDecoration: 'underline',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                  title="Click to view product on storefront in new tab"
                                >
                                  🔗 <strong>{item.title}</strong> × {item.quantity}
                                </a>
                                <span style={{ color: '#c0520d', fontWeight: 700 }}>
                                  {currency} {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingTop: '0.4rem',
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: '#1c1917'
                            }}>
                              <span>Order Total:</span>
                              <span style={{ color: '#c0520d', fontSize: '1.2rem', fontWeight: 800 }}>
                                {currency} {order.totalAmount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SPECIAL NOTE SYSTEM (Requirement: "can mark any order for special note") */}
                      <div style={{
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <Edit3 size={14} /> Admin Special Note for this Order:
                            {order.noteUpdatedBy && (
                              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                                (Annotated by: <strong style={{ color: '#1d4ed8' }}>{order.noteUpdatedBy}</strong>)
                              </span>
                            )}
                          </label>
                          {saveStatus[order.id] === 'saving' && (
                            <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>Saving...</span>
                          )}
                          {saveStatus[order.id] === 'saved' && (
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700 }}>Saved! ✓</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                          <textarea
                            rows={2}
                            placeholder="Add special notes (e.g. 'Agreed on ৳2,200 discount on WhatsApp', 'Customer requested maroon silk thread, wrist 6.8 inch', 'Scheduled courier on Monday')..."
                            value={editingNotes[order.id] ?? ''}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [order.id]: e.target.value })}
                            className="form-textarea"
                            style={{ flex: 1, fontSize: '0.85rem', background: '#ffffff', border: '1px solid #fed7aa' }}
                          />
                          <button
                            onClick={() => handleSaveSpecialNote(order.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.65rem 1rem', height: '100%' }}
                          >
                            <Save size={14} /> Save Note
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CATEGORY MANAGEMENT (Requirement: "admin can create category") */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fef3c7' }}>Product Categories</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Organize items like Baby Jewelry, Men's Bracelet, Earrings, Bangles, Anklets, and Clay & Thread Jewelry.
                </p>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} /> Add New Category
              </button>
            </div>

            {/* Categories Table/Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e7e2db',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ height: '120px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(28,25,23,0.85), transparent)'
                    }} />
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{cat.name}</h3>
                      <span className="badge" style={{ background: '#e26d21', color: '#ffffff', fontWeight: 700 }}>{cat.productCount ?? 0} Products</span>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: '1rem', flex: 1 }}>
                      {cat.description || 'No description added yet.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e7e2db', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c0520d', fontFamily: 'monospace', fontWeight: 600 }}>
                        slug: {cat.slug}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fecaca' }}
                        title="Delete Category"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: PRODUCT MANAGEMENT (WITH 3D MODEL ARCHETYPE)          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#1c1917' }}>Handcrafted Product Catalog</h2>
                <p style={{ fontSize: '0.85rem', color: '#78716c' }}>
                  Manage jewelry pieces, 3D interactive models, materials, and inventory.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div style={{ background: '#ffffff', border: '1px solid #e7e2db', borderRadius: 'var(--radius-md)', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e7e2db', background: '#faf8f5', color: '#57534e' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Item</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.85rem 1rem' }}>3 Photos (Gallery)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Stock</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                    .map(prod => {
                      const prodImages = (prod.images && prod.images.length > 0)
                        ? prod.images
                        : [prod.image, prod.image, prod.image].filter(Boolean);

                      return (
                        <tr key={prod.id} style={{ borderBottom: '1px solid #f3f0ea' }}>
                          <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img
                              src={prod.image}
                              alt={prod.title}
                              style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#1c1917' }}>{prod.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#78716c' }}>{prod.materials}</div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className="badge badge-gold">{prod.category?.replace(/-/g, ' ')}</span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#c0520d' }}>
                            {currency} {prod.price?.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {prodImages.slice(0, 3).map((imgUrl, i) => (
                                <img
                                  key={i}
                                  src={imgUrl}
                                  alt={`View ${i + 1}`}
                                  title={`Photo ${i + 1}: ${i === 0 ? 'Front' : i === 1 ? 'Side' : 'Craft'}`}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    objectFit: 'cover',
                                    border: '1px solid #e7e2db'
                                  }}
                                />
                              ))}
                              <span style={{ fontSize: '0.75rem', color: '#e26d21', fontWeight: 600, marginLeft: '4px' }}>
                                3 Photos
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#15803d', fontWeight: 600 }}>
                            {prod.stock} units
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#0284c7', borderColor: '#bae6fd', padding: '0.35rem 0.65rem', marginRight: '0.4rem' }}
                              title="Edit Product Details & Photos"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626', padding: '0.35rem 0.65rem' }}
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: STORE SETTINGS                                         */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '650px', padding: '2rem', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid #e7e2db', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '0.4rem' }}>
              Store & WhatsApp Configuration
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: '1.5rem' }}>
              Set where customer carts and orders are sent when they checkout via WhatsApp or Email.
            </p>

            {settingsSaved && (
              <div style={{
                background: 'rgba(5, 150, 105, 0.2)',
                border: '1px solid #059669',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} /> Store settings updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Store Brand Name</label>
                <input
                  type="text"
                  value={settings.storeName || ''}
                  onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store Owner WhatsApp Number (Country code without '+')</label>
                <input
                  type="text"
                  placeholder="e.g. 8801855636389"
                  value={settings.whatsappNumber || ''}
                  onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="form-input"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  This is the recipient phone number where customer carts will be sent directly.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Store Notification Email</label>
                <input
                  type="email"
                  placeholder="artisan@domain.com"
                  value={settings.email || ''}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency || '৳'}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  className="form-input"
                  style={{ maxWidth: '100px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Top Banner Announcement Ticker</label>
                <textarea
                  rows={2}
                  value={settings.announcement || ''}
                  onChange={e => setSettings({ ...settings, announcement: e.target.value })}
                  className="form-textarea"
                />
              </div>

              {/* Hero Banner Featured / Focused Product Selector */}
              <div className="form-group" style={{ background: '#faf8f5', border: '1px solid #e7e2db', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0, color: '#1c1917' }}>
                    🌟 Hero Banner Focused / Featured Product
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#e26d21', fontWeight: 600 }}>
                    Flagship Showcase
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                  Choose which handcrafted jewelry piece is displayed prominently in the top Hero Banner on the homepage.
                </span>

                <select
                  value={settings.featuredProductId || 'p-101'}
                  onChange={e => setSettings({ ...settings, featuredProductId: e.target.value })}
                  className="form-input"
                  style={{ fontWeight: 600, color: '#1c1917', marginBottom: '0.75rem', background: '#ffffff' }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {currency}{p.price?.toLocaleString()} ({categories.find(c => c.slug === p.category || c.id === p.category)?.name || p.category})
                    </option>
                  ))}
                </select>

                {/* Live Preview Card of Chosen Item */}
                {(() => {
                  const focusedProd = products.find(p => p.id === (settings.featuredProductId || 'p-101')) || products[0];
                  if (!focusedProd) return null;
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      background: '#ffffff',
                      border: '1px solid #e7e2db',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem'
                    }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2dcd5' }}>
                        <img
                          src={focusedProd.image}
                          alt={focusedProd.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {focusedProd.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                          <span style={{ color: '#e26d21', fontWeight: 700 }}>{currency} {focusedProd.price?.toLocaleString()}</span>
                          <span>•</span>
                          <span>{categories.find(c => c.slug === focusedProd.category || c.id === focusedProd.category)?.name || focusedProd.category}</span>
                        </div>
                      </div>
                      <span className="badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a', fontWeight: 700, fontSize: '0.72rem' }}>
                        Active in Hero
                      </span>
                    </div>
                  );
                })()}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Save size={16} /> Save Settings
              </button>
            </form>

            {/* Admin Password & Account Security Section */}
            <div style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '2px dashed #e7e2db'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e26d21'
                }}>
                  <Lock size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#1c1917', fontWeight: 700 }}>
                    Admin Password & Account Security
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#78716c' }}>
                    Protect your store by updating your administrator password securely.
                  </p>
                </div>
              </div>

              <div style={{
                background: '#faf8f5',
                border: '1px solid #e7e2db',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                marginTop: '1rem',
                maxWidth: '650px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c1917' }}>
                      Logged in Account:
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#c0520d', fontWeight: 600, marginTop: '0.2rem' }}>
                      {currentUser?.name || 'Administrator'} ({currentUser?.email})
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#78716c', marginTop: '0.2rem' }}>
                      Role: <strong style={{ color: currentUser?.role === 'superadmin' ? '#c0520d' : '#1d4ed8' }}>
                        {currentUser?.role === 'superadmin' ? 'Super Admin' : 'Standard Admin'}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordChangeError('');
                      setPasswordChangeSuccess('');
                      setShowPasswordModal(true);
                    }}
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#ffffff',
                      borderColor: '#fed7aa',
                      color: '#c0520d',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      padding: '0.6rem 1.2rem',
                      boxShadow: '0 2px 6px rgba(226, 109, 33, 0.12)'
                    }}
                  >
                    <Key size={16} /> Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: ADMIN TEAM & ROLES (SUPER ADMIN EXCLUSIVE)             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'admins' && currentUser?.role === 'superadmin' && (
          <div>
            {/* Super Admin Access Control Banner */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #faf8f5 0%, #fff7ed 100%)',
                border: '1px solid #fed7aa',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.2rem',
                boxShadow: '0 2px 8px rgba(226, 109, 33, 0.08)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', maxWidth: '750px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#e26d21',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(226, 109, 33, 0.3)'
                }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#1c1917', margin: 0, fontWeight: 700 }}>
                      Super Admin Security & Role-Based Control
                    </h3>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem', color: '#c0520d', background: '#fff' }}>
                      Protected Tier
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#78716c', margin: 0, lineHeight: 1.5 }}>
                    You have exclusive access to manage administrators. Standard Admins can operate daily website functions
                    (Catalog, Orders, Inquiries, and Store Settings) but <strong>CANNOT</strong> access this team management area,
                    nor can they ever delete or modify your Super Admin account.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddAdminModal(true)}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.86rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Plus size={16} /> Add New Administrator
              </button>
            </div>

            {/* Feedback Alerts */}
            {adminActionSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.2rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                color: '#166534',
                fontSize: '0.86rem',
                marginBottom: '1.4rem'
              }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <span>{adminActionSuccess}</span>
              </div>
            )}

            {adminActionError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.2rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.86rem',
                marginBottom: '1.4rem'
              }}>
                <AlertCircle size={18} color="#dc2626" />
                <span>{adminActionError}</span>
              </div>
            )}

            {/* Team Summary Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem'
            }}>
              <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Total Administrators</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1c1917', marginTop: '0.2rem' }}>
                  {adminList.length}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '0.2rem' }}>
                  All accounts active & verified
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Super Admin (Protected)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e26d21', marginTop: '0.2rem' }}>
                  {adminList.filter(a => a.role === 'superadmin').length}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#78716c', marginTop: '0.2rem' }}>
                  Primary account (Shawon)
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Standard Website Admins</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                  {adminList.filter(a => a.role !== 'superadmin').length}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#78716c', marginTop: '0.2rem' }}>
                  Operations & catalog management only
                </div>
              </div>
            </div>

            {/* Administrators Table Container */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{
                padding: '1.1rem 1.4rem',
                borderBottom: '1px solid #e7e2db',
                background: '#faf8f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1c1917', fontWeight: 700 }}>
                  Active Administrative Accounts
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#78716c' }}>
                  Showing {adminList.length} total staff accounts
                </span>
              </div>

              {isLoadingAdmins ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#78716c' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem' }} />
                  <div>Loading administrator records...</div>
                </div>
              ) : adminList.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#78716c' }}>
                  No administrators found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8f6f2', borderBottom: '1px solid #e7e2db', color: '#57534e' }}>
                        <th style={{ padding: '0.85rem 1.4rem', fontWeight: 600 }}>Administrator</th>
                        <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600 }}>Access Level / Role</th>
                        <th style={{ padding: '0.85rem 1.2rem', fontWeight: 600 }}>Account Created</th>
                        <th style={{ padding: '0.85rem 1.4rem', fontWeight: 600, textAlign: 'right' }}>Security Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminList.map((admin) => {
                        const isSuperAdmin = admin.role === 'superadmin' || admin.id === 'admin-super-01' || admin.email.toLowerCase() === 'shawon.cse.ku@gmail.com';

                        return (
                          <tr 
                            key={admin.id}
                            style={{
                              borderBottom: '1px solid #f0ebe4',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#faf8f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* Administrator Name & Email */}
                            <td style={{ padding: '1rem 1.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background: isSuperAdmin ? '#fff7ed' : '#eff6ff',
                                  border: `1px solid ${isSuperAdmin ? '#fed7aa' : '#bfdbfe'}`,
                                  color: isSuperAdmin ? '#c0520d' : '#1d4ed8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  flexShrink: 0
                                }}>
                                  {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#1c1917' }}>
                                    {admin.name}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#78716c' }}>
                                    {admin.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Access Level / Role Badge */}
                            <td style={{ padding: '1rem 1.2rem' }}>
                              {isSuperAdmin ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  background: '#fff7ed',
                                  border: '1px solid #fed7aa',
                                  color: '#c0520d',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.76rem',
                                  fontWeight: 700
                                }}>
                                  <ShieldCheck size={14} />
                                  Super Administrator
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.76rem',
                                  fontWeight: 600
                                }}>
                                  <User size={14} />
                                  Standard Admin (Website Ops)
                                </span>
                              )}
                            </td>

                            {/* Date Created */}
                            <td style={{ padding: '1rem 1.2rem', color: '#78716c', fontSize: '0.82rem' }}>
                              {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Primary Seed'}
                            </td>

                            {/* Security Actions */}
                            <td style={{ padding: '1rem 1.4rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetTargetAdmin(admin);
                                    setAdminResetNewPassword('');
                                    setAdminActionError('');
                                    setAdminActionSuccess('');
                                    setShowResetPw(false);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    color: '#0369a1',
                                    borderColor: '#bae6fd',
                                    background: '#f0f9ff',
                                    fontSize: '0.78rem',
                                    padding: '0.35rem 0.7rem',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    cursor: 'pointer'
                                  }}
                                  title={`Reset password for ${admin.name}`}
                                >
                                  <Key size={13} />
                                  Reset Password
                                </button>

                                {isSuperAdmin ? (
                                  <span 
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      color: '#059669',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      padding: '0.3rem 0.65rem',
                                      borderRadius: '6px'
                                    }}
                                    title="The primary Super Admin account is permanently locked against deletion"
                                  >
                                    <Lock size={13} />
                                    Protected
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                    className="btn btn-secondary btn-sm"
                                    style={{
                                      color: '#dc2626',
                                      borderColor: '#fca5a5',
                                      background: '#fff',
                                      fontSize: '0.78rem',
                                      padding: '0.35rem 0.75rem',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                                    title={`Remove ${admin.name} from admin team`}
                                  >
                                    <Trash2 size={13} />
                                    Remove
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ADD ADMINISTRATOR MODAL (SUPER ADMIN ONLY)                     */}
        {/* ------------------------------------------------------------- */}
        {showAddAdminModal && currentUser?.role === 'superadmin' && (
          <div className="modal-overlay" onClick={() => setShowAddAdminModal(false)}>
            <div 
              className="modal-content glass-panel" 
              onClick={e => e.stopPropagation()} 
              style={{ padding: '1.75rem', maxWidth: '500px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#e26d21',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#1c1917', margin: 0, fontWeight: 700 }}>
                      Add New Administrator
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#78716c' }}>
                      Grant administrative portal access
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#78716c',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Falguni Barua"
                    value={newAdminData.name}
                    onChange={e => setNewAdminData({ ...newAdminData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. falguni@example.com"
                    value={newAdminData.email}
                    onChange={e => setNewAdminData({ ...newAdminData, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                    Initial Password *
                  </label>
                  <input
                    type="text"
                    placeholder="Create a strong password"
                    value={newAdminData.password}
                    onChange={e => setNewAdminData({ ...newAdminData, password: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                    Role & Permission Tier
                  </label>
                  <select
                    value={newAdminData.role}
                    onChange={e => setNewAdminData({ ...newAdminData, role: e.target.value })}
                    className="form-select"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="admin">Standard Admin (Website Operations Only)</option>
                    <option value="superadmin">Super Admin (Full Access & User Management)</option>
                  </select>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: '#faf8f5',
                  borderRadius: '8px',
                  border: '1px solid #e7e2db',
                  fontSize: '0.78rem',
                  color: '#78716c',
                  marginBottom: '1.4rem'
                }}>
                  ℹ️ Standard Admins can operate catalog, orders, customer negotiations, and store settings,
                  but will <strong>NOT</strong> have access to create or delete other admins.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Administrator
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ADD CATEGORY MODAL                                            */}
        {/* ------------------------------------------------------------- */}
        {showAddCategoryModal && (
          <div className="modal-overlay" onClick={() => setShowAddCategoryModal(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#fef3c7', marginBottom: '1.25rem' }}>
                Add New Artisan Category
              </h2>
              <form onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Festive Silk Chokers"
                    value={newCategory.name}
                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the handcrafted technique or materials..."
                    value={newCategory.description}
                    onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <ImageUploadSlot
                  label="Category Cover Image"
                  helperText="Upload image from computer/phone or enter URL"
                  value={newCategory.image}
                  onChange={(val) => setNewCategory({ ...newCategory, image: val })}
                  onUpload={(file) => handleUploadImageFile(file, 'category', 'image')}
                  isUploading={uploadingKey === 'category-image'}
                  required={false}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ADD PRODUCT MODAL                                             */}
        {/* ------------------------------------------------------------- */}
        {showAddProductModal && (
          <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '650px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#1c1917', fontWeight: 700, marginBottom: '1.25rem' }}>
                Add New Handcrafted Item
              </h2>
              <form onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label className="form-label">Item Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Terracotta Filigree Choker"
                    value={newProduct.title}
                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="form-select"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Price ({currency}) *</label>
                    <input
                      type="number"
                      placeholder="1200"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Original Price</label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={newProduct.originalPrice}
                      onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Handcrafted Materials & Specs</label>
                  <input
                    type="text"
                    placeholder="e.g. River Terracotta Clay, Resham Silk Thread, Antique Brass"
                    value={newProduct.materials}
                    onChange={e => setNewProduct({ ...newProduct, materials: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* 3 Separate Product Pictures */}
                <div style={{ background: '#faf8f5', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e7e2db', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1c1917', margin: 0 }}>
                        Front , Close Up , Matching Product
                      </label>
                      <div style={{ fontSize: '0.75rem', color: '#78716c' }}>
                        Upload files directly from your computer or phone, or paste URLs.
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#e26d21', fontWeight: 600 }}>
                      Multi-Picture Showcase
                    </span>
                  </div>

                  <ImageUploadSlot
                    label="Picture 1: Front View"
                    helperText="Main catalog thumbnail"
                    value={newProduct.image1}
                    onChange={(val) => setNewProduct({ ...newProduct, image1: val })}
                    onUpload={(file) => handleUploadImageFile(file, 'new', 'image1')}
                    isUploading={uploadingKey === 'new-image1'}
                    required={true}
                  />

                  <ImageUploadSlot
                    label="Picture 2: Close Up View"
                    helperText="Macro texture, clay or embroidery detail"
                    value={newProduct.image2}
                    onChange={(val) => setNewProduct({ ...newProduct, image2: val })}
                    onUpload={(file) => handleUploadImageFile(file, 'new', 'image2')}
                    isUploading={uploadingKey === 'new-image2'}
                  />

                  <ImageUploadSlot
                    label="Picture 3: Matching Product"
                    helperText="Matching earrings, bracelet or set pieces"
                    value={newProduct.image3}
                    onChange={(val) => setNewProduct({ ...newProduct, image3: val })}
                    onUpload={(file) => handleUploadImageFile(file, 'new', 'image3')}
                    isUploading={uploadingKey === 'new-image3'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Artisan story, craftsmanship details, sizing info..."
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publish Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ------------------------------------------------------------- */}
        {/* EDIT PRODUCT MODAL                                            */}
        {/* ------------------------------------------------------------- */}
        {showEditProductModal && editingProduct && (
          <div className="modal-overlay" onClick={() => setShowEditProductModal(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '650px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#1c1917', fontWeight: 700, marginBottom: '1.25rem' }}>
                Edit Handcrafted Item (#{editingProduct.id})
              </h2>
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label className="form-label">Item Title *</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="form-select"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Price ({currency}) *</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Original Price</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice}
                      onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Handcrafted Materials & Specs</label>
                  <input
                    type="text"
                    value={editingProduct.materials}
                    onChange={e => setEditingProduct({ ...editingProduct, materials: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* 3 Separate Product Pictures */}
                <div style={{ background: '#faf8f5', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e7e2db', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1c1917', margin: 0 }}>
                        Front , Close Up , Matching Product
                      </label>
                      <div style={{ fontSize: '0.75rem', color: '#78716c' }}>
                        Upload new photos from your computer or phone to replace existing ones.
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#e26d21', fontWeight: 600 }}>
                      Multi-Picture Showcase
                    </span>
                  </div>

                  <ImageUploadSlot
                    label="Picture 1: Front View"
                    helperText="Main catalog thumbnail"
                    value={editingProduct.image1}
                    onChange={(val) => setEditingProduct({ ...editingProduct, image1: val })}
                    onUpload={(file) => handleUploadImageFile(file, 'edit', 'image1')}
                    isUploading={uploadingKey === 'edit-image1'}
                    required={true}
                  />

                  <ImageUploadSlot
                    label="Picture 2: Close Up View"
                    helperText="Macro texture, clay or embroidery detail"
                    value={editingProduct.image2}
                    onChange={(val) => setEditingProduct({ ...editingProduct, image2: val })}
                    onUpload={(file) => handleUploadImageFile(file, 'edit', 'image2')}
                    isUploading={uploadingKey === 'edit-image2'}
                  />

                  <ImageUploadSlot
                    label="Picture 3: Matching Product"
                    helperText="Matching earrings, bracelet or set pieces"
                    value={editingProduct.image3}
                    onChange={(val) => setEditingProduct({ ...editingProduct, image3: val })}
                    onUpload={(file) => handleUploadImageFile(file, 'edit', 'image3')}
                    isUploading={uploadingKey === 'edit-image3'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditProductModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHANGE OWN PASSWORD MODAL                                     */}
        {/* ------------------------------------------------------------- */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => !isSubmittingPassword && setShowPasswordModal(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#e26d21'
                  }}>
                    <Key size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#1c1917', fontWeight: 700 }}>
                      Change Admin Password
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#78716c' }}>
                      Update your login password for {currentUser?.name || currentUser?.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isSubmittingPassword}
                  style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {passwordChangeSuccess && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '0.84rem',
                  marginBottom: '1.2rem'
                }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>{passwordChangeSuccess}</span>
                </div>
              )}

              {passwordChangeError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '0.84rem',
                  marginBottom: '1.2rem'
                }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangeOwnPassword}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    Current Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={passwordChangeData.currentPassword}
                      onChange={e => setPasswordChangeData({ ...passwordChangeData, currentPassword: e.target.value })}
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{
                        position: 'absolute',
                        right: '0.6rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#78716c',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showCurrentPw ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    New Password (minimum 6 characters) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="Enter new strong password"
                      value={passwordChangeData.newPassword}
                      onChange={e => setPasswordChangeData({ ...passwordChangeData, newPassword: e.target.value })}
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{
                        position: 'absolute',
                        right: '0.6rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#78716c',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showNewPw ? 'Hide password' : 'Show password'}
                    >
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      placeholder="Re-type new password"
                      value={passwordChangeData.confirmPassword}
                      onChange={e => setPasswordChangeData({ ...passwordChangeData, confirmPassword: e.target.value })}
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      style={{
                        position: 'absolute',
                        right: '0.6rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#78716c',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn btn-secondary"
                    disabled={isSubmittingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingPassword}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {isSubmittingPassword ? (
                      <>
                        <RefreshCw size={14} className="spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUPERADMIN RESET TEAM MEMBER PASSWORD MODAL                  */}
        {/* ------------------------------------------------------------- */}
        {resetTargetAdmin && (
          <div className="modal-overlay" onClick={() => setResetTargetAdmin(null)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7'
                  }}>
                    <Key size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#1c1917', fontWeight: 700 }}>
                      Reset Admin Password
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#78716c' }}>
                      Setting new password for {resetTargetAdmin.name} ({resetTargetAdmin.email})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResetTargetAdmin(null)}
                  style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleResetTeamMemberPassword}>
                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    New Password (minimum 6 characters) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPw ? 'text' : 'password'}
                      placeholder="Enter new password for this admin"
                      value={adminResetNewPassword}
                      onChange={e => setAdminResetNewPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPw(!showResetPw)}
                      style={{
                        position: 'absolute',
                        right: '0.6rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#78716c',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={showResetPw ? 'Hide password' : 'Show password'}
                    >
                      {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => setResetTargetAdmin(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Check size={15} /> Confirm New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUploadSlot({
  label,
  value,
  onChange,
  onUpload,
  isUploading,
  required = false,
  helperText
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e7e2db',
      borderRadius: 'var(--radius-sm)',
      padding: '0.75rem',
      marginBottom: '0.75rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1c1917' }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </span>
        {helperText && (
          <span style={{ fontSize: '0.72rem', color: '#78716c' }}>{helperText}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        {/* Visual Thumbnail Preview */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #e2dcd5',
          background: '#f8f6f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {value ? (
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon size={22} color="#a8a29e" />
          )}
        </div>

        {/* Upload Action & URL Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label
              className="btn btn-secondary btn-sm"
              style={{
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                background: '#fef3c7',
                borderColor: '#fde68a',
                color: '#92400e',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {isUploading ? (
                <>
                  <RefreshCw size={13} className="spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={13} /> Upload Image File
                </>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onUpload(e.target.files[0]);
                  }
                }}
              />
            </label>

            {value && (
              <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <Check size={13} /> Image attached
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder="Or enter image URL (e.g. /uploads/image.jpg or https://...)"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
            required={required}
          />
        </div>
      </div>
    </div>
  );
}
