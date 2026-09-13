/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ProductDetailModal from './components/ProductDetailModal';
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
import AdminLoginModal from './components/AdminLoginModal';
import { 
  Sparkles, MessageSquare, ShoppingBag, Heart, ShieldCheck, 
  RotateCcw, SlidersHorizontal, Phone, Mail, ArrowUp, X, Truck, MapPin
} from 'lucide-react';

import fallbackData from './data/initialData.json';

export default function App() {
  const [categories, setCategories] = useState(fallbackData?.categories || []);
  const [products, setProducts] = useState(fallbackData?.products || []);
  const [settings, setSettings] = useState(fallbackData?.settings || {
    storeName: 'Falguni Handcraft',
    logo: '/logo.png',
    whatsappNumber: '8801855636389',
    email: 'shawon.cse.ku@gmail.com',
    currency: '৳',
    announcement: '✨ Exquisitely handcrafted: Discover customized Haldi sets, stylish bracelets, and anklets! Contact us via WhatsApp to order.'
  });

  const cleanWaNumber = (num) => (num ? String(num).replace(/[^0-9]/g, '').replace(/^0/, '880') : '8801855636389');

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState('featured'); // 'featured' | 'low-high' | 'high-low'

  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('falguni_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Cart & Wishlist state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('falguni_cart') || localStorage.getItem('karukala_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('falguni_wishlist') || localStorage.getItem('karukala_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Panels state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const productsSectionRef = useRef(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('falguni_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem('falguni_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Fetch initial storefront data
  const loadData = async () => {
    try {
      const [catsRes, prodsRes, settingsRes] = await Promise.all([
        fetch('/api/categories').then(r => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/products').then(r => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/settings').then(r => (r.ok ? r.json() : null)).catch(() => null)
      ]);

      if (Array.isArray(catsRes) && catsRes.length > 0) setCategories(catsRes);
      if (Array.isArray(prodsRes) && prodsRes.length > 0) setProducts(prodsRes);
      if (settingsRes && typeof settingsRes === 'object') setSettings(prev => ({ ...prev, ...settingsRes }));
    } catch (err) {
      console.warn('Backend API not reachable; running with fallback catalog data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL deep linking (e.g. ?product=p-111 or ?id=p-111)
  useEffect(() => {
    if (!products || products.length === 0) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product') || urlParams.get('id');
      if (productId) {
        const found = products.find(
          p => String(p.id).toLowerCase() === String(productId).toLowerCase() || 
               p.slug === productId
        );
        if (found) {
          setSelectedProductForDetail(found);
          setIsAdminMode(false);
          if (found.category) {
            setActiveCategory(found.category);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing product URL parameter:', e);
    }
  }, [products]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product') || urlParams.get('id');
        if (productId && products.length > 0) {
          const found = products.find(
            p => String(p.id).toLowerCase() === String(productId).toLowerCase() || 
                 p.slug === productId
          );
          if (found) {
            setSelectedProductForDetail(found);
            setIsAdminMode(false);
          } else {
            setSelectedProductForDetail(null);
          }
        } else {
          setSelectedProductForDetail(null);
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  const handleOpenProductDetail = (product) => {
    if (!product) return;
    setSelectedProductForDetail(product);
    try {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('product', product.id);
      window.history.pushState({ productId: product.id }, '', newUrl.toString());
    } catch (e) {}
  };

  const handleCloseProductDetail = () => {
    setSelectedProductForDetail(null);
    try {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('product');
      newUrl.searchParams.delete('id');
      window.history.pushState({}, '', newUrl.toString());
    } catch (e) {}
  };

  // Authentication Handlers
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('falguni_admin_session', JSON.stringify(user));
      if (token) localStorage.setItem('falguni_admin_token', token);
    } catch (e) {
      console.error('Failed to persist admin session:', e);
    }
    setIsAdminMode(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('falguni_admin_session');
      localStorage.removeItem('falguni_admin_token');
    } catch (e) {
      console.error('Failed to remove admin session:', e);
    }
    setIsAdminMode(false);
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Instant "Buy Now" / "Order on WhatsApp"
  const handleOrderNow = (product, quantity = 1) => {
    // Put item in cart if not there and open checkout directly
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: Math.max(item.quantity, quantity) } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCheckoutOpen(true);
  };

  // Wishlist toggle
  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Scroll smoothly to products
  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter and sort products with smart relevance scoring
  const q = searchQuery.toLowerCase().trim();

  const getRelevance = (p, term) => {
    const title = (p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase().replace(/-/g, ' ');
    const words = title.split(/\s+/);
    const catWords = cat.split(/\s+/);
    let score = 0;

    if (title.startsWith(term)) score += 150;
    else if (words.some(w => w.startsWith(term))) score += 100;
    else if (cat.startsWith(term) || catWords.some(w => w.startsWith(term))) score += 80;
    else if (title.includes(term)) score += 50;
    else if (cat.includes(term)) score += 35;

    if (term.length <= 2) {
      const matWords = (p.materials || '').toLowerCase().split(/[\s,]+/);
      if (matWords.some(w => w.startsWith(term))) score += 15;
    } else {
      if ((p.materials || '').toLowerCase().includes(term)) score += 15;
      if ((p.description || '').toLowerCase().includes(term)) score += 10;
    }
    return score;
  };

  const filteredProducts = products.filter(p => {
    if (!q) {
      return activeCategory === 'all' || p.category === activeCategory;
    }
    const score = getRelevance(p, q);
    const matchesCat = (!q || activeCategory === 'all' || p.category === activeCategory);
    return matchesCat && score > 0;
  });

  if (priceSort === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (q) {
    // Relevance sort by default when actively searching
    filteredProducts.sort((a, b) => getRelevance(b, q) - getRelevance(a, q));
  }

  const currency = settings?.currency || '৳';
  const cartItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        settings={settings}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(catSlug) => {
          setActiveCategory(catSlug);
          scrollToProducts();
        }}
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onToggleWishlist={() => setShowWishlistModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminMode={isAdminMode}
        setIsAdminMode={(mode) => {
          if (mode && !currentUser) {
            setIsLoginModalOpen(true);
          } else {
            setIsAdminMode(mode);
          }
        }}
        products={products}
        onSelectProduct={setSelectedProductForDetail}
        onSearchSubmit={scrollToProducts}
        currency={currency}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Content: Storefront or Admin Panel */}
      {isAdminMode && currentUser ? (
        <React.Suspense fallback={
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#78716c' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e7e5e4', borderTopColor: '#e26d21', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>Loading Admin Console...</p>
          </div>
        }>
          <AdminPanel
            initialSettings={settings}
            onRefreshData={loadData}
            currency={currency}
            currentUser={currentUser}
          />
        </React.Suspense>
      ) : (
        <main style={{ flex: 1 }}>
          {/* Hero Banner with Categories Showcase */}
          <HeroBanner
            categories={categories}
            onSelectCategory={(catSlug) => {
              setActiveCategory(catSlug);
              scrollToProducts();
            }}
            onScrollToProducts={scrollToProducts}
            featuredProduct={products.find(p => p.id === settings?.featuredProductId) || products.find(p => p.id === 'p-101') || products[0]}
            onSelectProduct={handleOpenProductDetail}
            settings={settings}
          />

          {/* Product Gallery Showcase */}
          <section ref={productsSectionRef} style={{
            background: 'linear-gradient(180deg, #0b192e 0%, #112240 100%)',
            padding: '4rem 0',
            borderTop: '1px solid #1e3a5f',
            borderBottom: '1px solid #1e3a5f'
          }}>
            <div className="container">
              {/* Header & Filter Controls Bar */}
              <div 
                className="catalog-controls-bar"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  paddingBottom: '1.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">Handcrafted Catalog</span>
                    <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>
                      Showing {filteredProducts.length} artisan creation(s)
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.6rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <X size={12} /> Clear search: "{searchQuery}"
                      </button>
                    )}
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', color: '#ffffff', marginTop: '0.35rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : (activeCategory === 'all'
                          ? 'Featured Handcrafted Collection'
                          : categories.find(c => c.slug === activeCategory || c.id === activeCategory)?.name || 'Collection')}
                  </h2>
                </div>

                {/* Sort Dropdown & Quick WhatsApp inquiry */}
                <div className="catalog-sort-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <SlidersHorizontal size={14} color="#38bdf8" /> Sort:
                  </div>
                  <select
                    value={priceSort}
                    onChange={e => setPriceSort(e.target.value)}
                    style={{
                      width: 'auto',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      background: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="featured" style={{ background: '#1e293b', color: '#fff' }}>Featured Artisans</option>
                    <option value="low-high" style={{ background: '#1e293b', color: '#fff' }}>Price: Low to High</option>
                    <option value="high-low" style={{ background: '#1e293b', color: '#fff' }}>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="glass-panel" style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-muted)'
                }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {searchQuery ? `No handcrafted items match "${searchQuery}"` : 'No handcrafted items found'}
                  </h3>
                  <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                    {searchQuery 
                      ? 'Try searching for popular artisan tags like "haldi", "terracotta", "clay", "earrings", or "bracelet".'
                      : 'Try clearing your search query or selecting another artisan category.'}
                  </p>
                  <button
                    onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                    className="btn btn-primary btn-sm"
                  >
                    View All Items
                  </button>
                </div>
              ) : (
                <div className="products-grid-container">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      onAddToCart={handleAddToCart}
                      onOrderNow={handleOrderNow}
                      onOpenDetail={handleOpenProductDetail}
                      isWishlisted={wishlist.some(p => p.id === product.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Artisan Value Guarantees (Aarong Clean Ivory Section) */}
          <section style={{
            background: '#faf8f5',
            borderTop: '1px solid #e7e2db',
            borderBottom: '1px solid #e7e2db',
            padding: '3rem 0'
          }}>
            <div className="container guarantee-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MessageSquare size={22} color="#059669" />
                </div>
                <div>
                  <h4 style={{ color: '#1c1917', fontSize: '1.05rem', marginBottom: '0.25rem' }}>WhatsApp Direct Negotiation</h4>
                  <p style={{ fontSize: '0.82rem', color: '#78716c' }}>
                    No payment gateway barrier. Checkout sends your cart straight to the maker on WhatsApp for instant customization.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={22} color="#e26d21" />
                </div>
                <div>
                  <h4 style={{ color: '#1c1917', fontSize: '1.05rem', marginBottom: '0.25rem' }}>100% Artisan Craftsmanship</h4>
                  <p style={{ fontSize: '0.82rem', color: '#78716c' }}>
                    Genuine river clay, silk thread, and beaten brass hand-crafted by dedicated cottage entrepreneurs.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Truck size={22} color="#0284c7" />
                </div>
                <div>
                  <h4 style={{ color: '#1c1917', fontSize: '1.05rem', marginBottom: '0.25rem' }}>All Bangladesh Delivery</h4>
                  <p style={{ fontSize: '0.82rem', color: '#78716c' }}>
                    Cash on Delivery & bKash across Dhaka, Chattogram, Sylhet, and all 64 districts with careful protective packaging.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Floating WhatsApp Button (Bottom Right) */}
      <a
        href={`https://wa.me/${cleanWaNumber(settings?.whatsappNumber)}?text=${encodeURIComponent(
          cart.length > 0
            ? `Hello ${settings?.storeName || 'Falguni Handcraft'}! I have ${cart.length} handcrafted item(s) in my cart and would like to talk with you:\n\n` +
              cart.map((item, idx) => `${idx + 1}. *${item.title}* (x${item.quantity}) - Tk ${(item.price * item.quantity).toLocaleString()}\n   Link: ${(typeof window !== 'undefined' ? window.location.origin : 'https://falgunishandcraft.com')}/?product=${encodeURIComponent(item.id)}`).join('\n\n') +
              `\n\n*Subtotal:* Tk ${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}\n\nPlease let me know the details!`
            : `Hello ${settings?.storeName || 'Falguni Handcraft'}! I'm browsing your handcrafted jewelry store and would like to talk with you.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Chat on WhatsApp"
      >
        <MessageSquare size={18} />
        <span className="floating-whatsapp-text">Chat with Us</span>
      </a>

      {/* Footer (Aarong Signature Dark Charcoal Base with Orange Accents) */}
      <footer style={{
        background: '#1c1917',
        borderTop: '1px solid #292524',
        padding: '3.5rem 0 2rem',
        marginTop: 'auto',
        color: '#d6d3d1'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.4), 0 0 0 2px #e26d21',
                  flexShrink: 0,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={settings?.logo || "/logo.png"}
                    alt={settings?.storeName || "Falguni Handcraft - Handcrafted Jewelry Bangladesh"}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.32)', display: 'block' }}
                  />
                </div>
                <h3 style={{ fontSize: '1.45rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>
                  <span style={{ color: '#e26d21' }}>Falguni</span> Handcraft
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#a8a29e', lineHeight: 1.6, marginBottom: '0.8rem' }}>
                Exquisitely handcrafted aesthetic seed bead, thread, and clay jewelry in Bangladesh. Custom Gaye Holud sets, bridal accessories, and stylish bracelets crafted for your special moments.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Phone size={14} color="#25d366" /> WhatsApp: +{cleanWaNumber(settings?.whatsappNumber)}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#d6d3d1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="#e26d21" /> Chittagong , Bangladesh. Delivery all 64 districts
              </div>
            </div>

            {/* Categories Links */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>
                Artisan Collections
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#a8a29e' }}>
                {categories.map(c => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setIsAdminMode(false);
                        setActiveCategory(c.slug || c.id);
                        scrollToProducts();
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                      onMouseEnter={e => e.target.style.color = '#e26d21'}
                      onMouseLeave={e => e.target.style.color = '#a8a29e'}
                    >
                      • {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Contact & Admin Access */}
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>
                Store Administration
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#a8a29e', marginBottom: '1rem' }}>
                Site owners and store managers can access the real-time order dashboard and inventory system.
              </p>
              <button
                onClick={() => setIsAdminMode(true)}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#e26d21', color: '#e26d21', background: '#ffffff' }}
              >
                Access Admin Portal
              </button>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #292524',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#78716c',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span>© {new Date().getFullYear()} {settings?.storeName || 'Falguni Handcraft'}. All rights reserved.</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span>
                Developed by{' '}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=shawon.cse.ku@gmail.com&su=Project%20Inquiry%20-%20NextGen%20Work"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#fb923c',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fed7aa')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#fb923c')}
                  title="Send email to shawon.cse.ku@gmail.com"
                >
                  NextGen Work
                </a>
              </span>
            </div>
            <div>Exquisite Handcrafted Jewellery with Customized Colors & Designs</div>
          </div>
        </div>
      </footer>


      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenDetail={(item) => {
          setIsCartOpen(false);
          handleOpenProductDetail(item);
        }}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        currency={currency}
      />

      {/* Checkout Modal (WhatsApp / Email Submission) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currency={currency}
        settings={settings}
        onOpenDetail={(item) => {
          setIsCheckoutOpen(false);
          handleOpenProductDetail(item);
        }}
        onOrderSuccess={(order) => {
          handleClearCart();
          loadData();
        }}
      />

      {/* 3-Picture Interactive Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          settings={settings}
          isOpen={!!selectedProductForDetail}
          onClose={handleCloseProductDetail}
          onAddToCart={(prod, qty) => {
            handleAddToCart(prod, qty);
            handleCloseProductDetail();
            setIsCartOpen(true);
          }}
        />
      )}

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <div className="modal-overlay" onClick={() => setShowWishlistModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={20} color="#e26d21" fill="#e26d21" />
                <h3 style={{ fontSize: '1.3rem', color: '#1c1917', fontWeight: 700 }}>Your Wishlist ({wishlist.length})</h3>
              </div>
              <button
                onClick={() => setShowWishlistModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                Your saved wishlist is empty. Tap the heart on any product to save it here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '380px', overflowY: 'auto' }}>
                {wishlist.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '0.8rem',
                      alignItems: 'center',
                      background: '#faf8f5',
                      border: '1px solid #e7e2db',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <img src={item.image} alt={item.title} style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e7e2db' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', color: '#1c1917', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#c0520d', fontWeight: 700 }}>
                        {currency} {item.price?.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          handleAddToCart(item, 1);
                          setShowWishlistModal(false);
                          setIsCartOpen(true);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a8a29e',
                          cursor: 'pointer',
                          padding: '0.4rem'
                        }}
                        title="Remove from wishlist"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
