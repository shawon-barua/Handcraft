import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Package, Settings, 
  DollarSign, TrendingUp, Clock, CheckCircle2, MessageSquare, 
  Edit3, Trash2, Plus, Save, Search, Filter, ExternalLink, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';

export default function AdminPanel({
  initialSettings,
  onRefreshData,
  currency = '৳'
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'categories' | 'products' | 'settings'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(initialSettings || {});
  const [isLoading, setIsLoading] = useState(true);

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
    category: 'clay-and-thread-jwelery',
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

  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch admin data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, catsRes, prodsRes, settingsRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
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

  useEffect(() => {
    fetchData();
  }, []);

  // Handle saving Special Note on an Order
  const handleSaveSpecialNote = async (orderId) => {
    const note = editingNotes[orderId] || '';
    setSaveStatus(prev => ({ ...prev, [orderId]: 'saving' }));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialNote: note })
      });

      if (res.ok) {
        setSaveStatus(prev => ({ ...prev, [orderId]: 'saved' }));
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [orderId]: null }));
        }, 2000);
        // Refresh orders
        const updated = await fetch('/api/orders').then(r => r.json());
        setOrders(updated);
      }
    } catch (err) {
      console.error('Failed to save special note:', err);
      setSaveStatus(prev => ({ ...prev, [orderId]: 'error' }));
    }
  };

  // Handle Order Status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh orders and stats
        const [updatedOrders, updatedStats] = await Promise.all([
          fetch('/api/orders').then(r => r.json()),
          fetch('/api/stats').then(r => r.json())
        ]);
        setOrders(updatedOrders);
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Handle Creating Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (res.ok) {
        setShowAddCategoryModal(false);
        setNewCategory({ name: '', description: '', image: '', icon: 'Sparkles' });
        const cats = await fetch('/api/categories').then(r => r.json());
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
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        const cats = await fetch('/api/categories').then(r => r.json());
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
      const res = await fetch('/api/products', {
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
          category: categories[0]?.slug || 'clay-and-thread-jwelery',
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
        const prods = await fetch('/api/products').then(r => r.json());
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
      const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        const prods = await fetch('/api/products').then(r => r.json());
        setProducts(prods);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
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
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-gold" style={{ color: '#c0520d', borderColor: '#fed7aa', background: '#fff7ed' }}>Artisan Portal</span>
              <span style={{ fontSize: '0.8rem', color: '#78716c' }}>Backend Management & Analytics</span>
            </div>
            <h1 style={{ fontSize: '2rem', color: '#1c1917', marginTop: '0.2rem' }}>
              Store Administration
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
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
            { id: 'settings', label: 'Store Settings', icon: Settings }
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
              {/* Total Orders */}
              <div className="glass-panel" style={{ padding: '1.35rem', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid #e7e2db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Inquiries / Orders</span>
                  <ShoppingBag size={18} color="#e26d21" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1c1917' }}>
                  {stats?.totalOrders ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.3rem', fontWeight: 500 }}>
                  Via WhatsApp & Email checkout
                </div>
              </div>

              {/* Total Sales */}
              <div className="glass-panel" style={{ padding: '1.35rem', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid #e7e2db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Confirmed Sales</span>
                  <DollarSign size={18} color="#15803d" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#c0520d' }}>
                  {currency} {(stats?.totalSale ?? 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.3rem' }}>
                  Negotiated / Confirmed orders
                </div>
              </div>

              {/* In Negotiation */}
              <div className="glass-panel" style={{ padding: '1.35rem', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid #e7e2db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>In Active Negotiation</span>
                  <MessageSquare size={18} color="#2563eb" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2563eb' }}>
                  {stats?.inNegotiationCount ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.3rem' }}>
                  Potential: {currency} {(stats?.potentialNegotiationSale ?? 0).toLocaleString()}
                </div>
              </div>

              {/* Active Products */}
              <div className="glass-panel" style={{ padding: '1.35rem', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid #e7e2db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#78716c', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Catalog Inventory</span>
                  <Package size={18} color="#7c3aed" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1c1917' }}>
                  {stats?.totalProducts ?? 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.3rem' }}>
                  Across {stats?.totalCategories ?? 0} artisan categories
                </div>
              </div>
            </div>

            {/* Category Performance Breakdown */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                Category Distribution & Catalog Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {(stats?.categoryStats || []).map((cat, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{cat.name}</strong>
                      <span className="badge badge-clay">{cat.productCount} Items</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Total items ordered: <span style={{ color: '#fcd34d', fontWeight: 600 }}>{cat.ordersItemCount}</span>
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Status:</span>
                {['all', 'In Negotiation', 'Confirmed', 'In Crafting', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      border: orderStatusFilter === status ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      background: orderStatusFilter === status ? 'rgba(217, 119, 6, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: orderStatusFilter === status ? '#fcd34d' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    {status === 'all' ? 'All Orders' : status}
                  </button>
                ))}
              </div>

              {/* Order Search */}
              <div style={{ position: 'relative', width: '260px' }}>
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
                  const waChatUrl = `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(`Salam ${order.customer?.name}! This is KaruKala Artisans regarding your order #${order.id}.`)}`;

                  return (
                    <div
                      key={order.id}
                      style={{
                        padding: '1.5rem',
                        background: '#ffffff',
                        border: '1px solid #e7e2db',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: order.status === 'Confirmed' ? '4px solid #15803d' :
                                    order.status === 'In Negotiation' ? '4px solid #e26d21' :
                                    order.status === 'Delivered' ? '4px solid #16a34a' : '4px solid #3b82f6'
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1c1917' }}>
                            #{order.id}
                          </span>
                          <span className={`badge ${order.channel === 'whatsapp' ? 'badge-green' : 'badge-gold'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MessageSquare size={12} /> Via {order.channel?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#78716c' }}>
                            {new Date(order.orderDate).toLocaleString()}
                          </span>
                        </div>

                        {/* Status Switcher */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Order Status:</span>
                          <select
                            value={order.status}
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
                            <option value="Pending Review">Pending Review</option>
                            <option value="In Negotiation">In Negotiation</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Crafting">In Crafting</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
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
                                <span>
                                  <strong>{item.title}</strong> × {item.quantity}
                                </span>
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
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Edit3 size={14} /> Admin Special Note for this Order:
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
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
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
                  placeholder="e.g. 8801712345678"
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

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Save size={16} /> Save Settings
              </button>
            </form>
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

                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newCategory.image}
                    onChange={e => setNewCategory({ ...newCategory, image: e.target.value })}
                    className="form-input"
                  />
                </div>

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
              <h2 style={{ fontSize: '1.3rem', color: '#fef3c7', marginBottom: '1.25rem' }}>
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
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917', margin: 0 }}>
                      📸 3 Product Pictures (Front, Side & Craft Details)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#e26d21', fontWeight: 600 }}>
                      Multi-Angle Gallery
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Picture 1: Front / Primary View *</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (Main Showcase)"
                      value={newProduct.image1}
                      onChange={e => setNewProduct({ ...newProduct, image1: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Picture 2: Side / Profile Angle View</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (Side view)"
                      value={newProduct.image2}
                      onChange={e => setNewProduct({ ...newProduct, image2: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.2rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Picture 3: Craft / Macro Texture View</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (Detail / Craft view)"
                      value={newProduct.image3}
                      onChange={e => setNewProduct({ ...newProduct, image3: e.target.value })}
                      className="form-input"
                    />
                  </div>
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
      </div>
    </div>
  );
}
