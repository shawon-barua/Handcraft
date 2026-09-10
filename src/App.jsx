import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ProductDetailModal from './components/ProductDetailModal';
import AdminPanel from './components/AdminPanel';
import { 
  Sparkles, MessageSquare, ShoppingBag, Heart, ShieldCheck, 
  RotateCcw, SlidersHorizontal, Images, Phone, Mail, ArrowUp
} from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    storeName: 'Falguni Handcraft',
    logo: '/logo.png',
    whatsappNumber: '8801712345678',
    email: 'falgunihandcraft@gmail.com',
    currency: '৳',
    announcement: '✨ Exquisitely handcrafted: Discover customized Haldi sets, stylish bracelets, and anklets! Contact us via WhatsApp to order.'
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState('featured'); // 'featured' | 'low-high' | 'high-low'

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
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      setCategories(catsRes);
      setProducts(prodsRes);
      setSettings(settingsRes);
    } catch (err) {
      console.error('Error fetching storefront data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(q) ||
      (p.materials && p.materials.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  if (priceSort === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
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
        setIsAdminMode={setIsAdminMode}
      />

      {/* Main Content: Storefront or Admin Panel */}
      {isAdminMode ? (
        <AdminPanel
          initialSettings={settings}
          onRefreshData={loadData}
          currency={currency}
        />
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
          />

          {/* Product Gallery Showcase */}
          <section ref={productsSectionRef} style={{ padding: '3.5rem 0' }}>
            <div className="container">
              {/* Header & Filter Controls Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-gold">Handcrafted Catalog</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Showing {filteredProducts.length} artisan creation(s)
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', color: '#fef3c7', marginTop: '0.2rem' }}>
                    {activeCategory === 'all'
                      ? 'Featured Handcrafted Collection'
                      : categories.find(c => c.slug === activeCategory || c.id === activeCategory)?.name || 'Collection'}
                  </h2>
                </div>

                {/* Sort Dropdown & Quick WhatsApp inquiry */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <SlidersHorizontal size={14} /> Sort:
                  </div>
                  <select
                    value={priceSort}
                    onChange={e => setPriceSort(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    <option value="featured">Featured Artisans</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Products Grid (geobagbd layout) */}
              {filteredProducts.length === 0 ? (
                <div className="glass-panel" style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-muted)'
                }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    No handcrafted items found
                  </h3>
                  <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                    Try clearing your search query or selecting another artisan category.
                  </p>
                  <button
                    onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                    className="btn btn-primary btn-sm"
                  >
                    View All Items
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      onAddToCart={handleAddToCart}
                      onOrderNow={handleOrderNow}
                      onOpenDetail={(prod) => setSelectedProductForDetail(prod)}
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
            <div className="container" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem'
            }}>
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
                  <Images size={22} color="#e26d21" />
                </div>
                <div>
                  <h4 style={{ color: '#1c1917', fontSize: '1.05rem', marginBottom: '0.25rem' }}>3 Photos per Item</h4>
                  <p style={{ fontSize: '0.82rem', color: '#78716c' }}>
                    Inspect 3 separate high-definition angles (front, side & macro craftsmanship details) before ordering.
                  </p>
                </div>
              </div>

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
            </div>
          </section>
        </main>
      )}

      {/* Floating WhatsApp Button (Bottom Right) */}
      <a
        href={`https://wa.me/${settings?.whatsappNumber || '8801712345678'}?text=${encodeURIComponent("Salam Falguni Handcraft! I'm browsing your handcrafted jewelry store and would like to ask a question.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Chat on WhatsApp"
      >
        <MessageSquare size={18} />
        <span>Chat with Us</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  border: '1.5px solid #fed7aa',
                  flexShrink: 0,
                  background: '#fff'
                }}>
                  <img
                    src={settings?.logo || "/logo.png"}
                    alt={settings?.storeName || "Falguni Handcraft"}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                  {settings?.storeName || 'Falguni Handcraft'}
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#a8a29e', lineHeight: 1.6, marginBottom: '1rem' }}>
                Exquisitely handcrafted aesthetic seed bead, thread, and clay designs. Custom Haldi sets, stylish bracelets, and anklets made to match your special occasions.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="#25d366" /> WhatsApp: +{settings?.whatsappNumber || '8801712345678'}
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
            <div>© {new Date().getFullYear()} {settings?.storeName || 'Falguni Handcraft'}. All rights reserved.</div>
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
        onOrderSuccess={(order) => {
          handleClearCart();
          loadData();
        }}
      />

      {/* 3-Picture Interactive Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          isOpen={!!selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={(prod, qty) => {
            handleAddToCart(prod, qty);
            setSelectedProductForDetail(null);
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
                <Heart size={20} color="#ef4444" fill="#ef4444" />
                <h3 style={{ fontSize: '1.3rem', color: '#fef3c7' }}>Your Wishlist ({wishlist.length})</h3>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '350px', overflowY: 'auto' }}>
                {wishlist.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '0.8rem',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <img src={item.image} alt={item.title} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#fcd34d', fontWeight: 600 }}>
                        {currency} {item.price?.toLocaleString()}
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
