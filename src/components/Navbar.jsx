import React from 'react';
import { ShoppingBag, Heart, Sparkles, Search, MessageSquare, LayoutDashboard, Store } from 'lucide-react';

export default function Navbar({ 
  settings, 
  categories, 
  activeCategory, 
  onSelectCategory, 
  cartCount, 
  onOpenCart, 
  wishlistCount, 
  onToggleWishlist,
  searchQuery, 
  setSearchQuery,
  isAdminMode,
  setIsAdminMode
}) {
  const cleanWaNumber = (num) => (num ? String(num).replace(/[^0-9]/g, '').replace(/^0/, '880') : '8801855636389');

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 800 }}>
      {/* Top Announcement Bar (Aarong Black with Orange Accent) */}
      <div 
        className="top-announcement-bar"
        style={{
          background: '#1c1917',
          color: '#f5f5f4',
          padding: '0.45rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid #292524'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          <Sparkles size={13} color="var(--primary-light)" />
          <span style={{ fontWeight: 400 }}>{settings?.announcement || '✨ Authentic Handcrafted Artisanal Heritage — Direct WhatsApp negotiation available!'}</span>
        </div>
        <div className="top-announcement-phone" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.8rem' }}>
          <a 
            href={`https://wa.me/${cleanWaNumber(settings?.whatsappNumber)}`}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#fed7aa', fontWeight: 600 }}
          >
            <MessageSquare size={13} color="#25d366" /> WhatsApp: +{cleanWaNumber(settings?.whatsappNumber)}
          </a>
        </div>
      </div>

      {/* Main Navbar (Crisp Aarong White & Clean Charcoal) */}
      <div 
        className="navbar-wrapper"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.9rem 0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div className="container navbar-container">
          {/* Top Row on Mobile / Left & Right on Desktop */}
          <div className="navbar-top-row">
            {/* Logo & Tagline */}
            <div 
              onClick={() => setIsAdminMode(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 3px 10px rgba(226, 109, 33, 0.22)',
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
              <div>
                <h1 className="navbar-brand-title" style={{ fontSize: '1.65rem', lineHeight: 1.1, color: '#1c1917', display: 'flex', alignItems: 'center', gap: '0.45rem', letterSpacing: '-0.01em', margin: 0 }}>
                  {settings?.storeName || 'Falguni Handcraft'}
                </h1>
                <span className="navbar-brand-subtitle" style={{ fontSize: '0.72rem', color: '#78716c', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                  Aesthetic Bead, Thread & Clay Jewellery
                </span>
              </div>
            </div>

            {/* Action Icons & Admin Mode Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Wishlist */}
              <button
                onClick={onToggleWishlist}
                className="btn btn-secondary btn-sm"
                style={{ position: 'relative', borderRadius: 'var(--radius-full)', padding: '0.5rem 0.75rem', minWidth: '38px', minHeight: '38px' }}
                title="View Wishlist"
              >
                <Heart size={18} color={wishlistCount > 0 ? '#e26d21' : '#44403c'} fill={wishlistCount > 0 ? '#e26d21' : 'none'} />
                {wishlistCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#e26d21',
                    color: '#fff',
                    fontSize: '0.68rem',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Button with Count (Aarong Orange) */}
              <button
                onClick={onOpenCart}
                className="btn btn-primary btn-sm"
                style={{ position: 'relative', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', minHeight: '38px' }}
              >
                <ShoppingBag size={17} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span style={{
                    background: '#1c1917',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    marginLeft: '0.2rem'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Admin Panel Toggle */}
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={isAdminMode ? "btn btn-dark btn-sm" : "btn btn-secondary btn-sm"}
                style={{
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  border: isAdminMode ? 'none' : '1px solid #d6d0c7',
                  padding: '0.5rem 0.8rem',
                  minHeight: '38px'
                }}
                title={isAdminMode ? "Switch to Storefront" : "Switch to Admin"}
              >
                {isAdminMode ? (
                  <>
                    <Store size={15} /> <span style={{ display: 'inline' }}>Store</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard size={15} /> <span style={{ display: 'inline' }}>Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Box - Responsive Full Width on Mobile, Centered/Compact on Desktop */}
          {!isAdminMode && (
            <div className="navbar-search-wrapper" style={{ flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
              <input
                type="text"
                placeholder="Search Haldi sets, bracelets, anklets, clay & bead..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #d6d0c7',
                  background: '#fbf9f6',
                  color: '#1c1917',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation Bar (when in Storefront) */}
      {!isAdminMode && (
        <div 
          className="touch-scroll hide-scrollbar"
          style={{
            background: '#faf8f5',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '0.55rem 0'
          }}
        >
          <div className="container" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              onClick={() => onSelectCategory('all')}
              style={{
                background: activeCategory === 'all' ? '#e26d21' : 'transparent',
                color: activeCategory === 'all' ? '#ffffff' : '#57534e',
                fontWeight: activeCategory === 'all' ? 700 : 500,
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                flexShrink: 0
              }}
            >
              All Items
            </button>

            {categories.map(cat => {
              const isSelected = activeCategory === cat.slug || activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug || cat.id)}
                  style={{
                    background: isSelected ? '#e26d21' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#44403c',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? '1px solid #e26d21' : '1px solid #e7e2db',
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: isSelected ? '0 2px 8px rgba(226, 109, 33, 0.25)' : 'none',
                    flexShrink: 0
                  }}
                >
                  <span>{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: isSelected ? 'rgba(255,255,255,0.25)' : '#f3f0ea',
                      color: isSelected ? '#ffffff' : '#78716c',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '10px'
                    }}>
                      {cat.productCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
