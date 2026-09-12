import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Heart, Sparkles, Search, MessageSquare, LayoutDashboard, Store, X, ArrowRight } from 'lucide-react';

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
  setIsAdminMode,
  products = [],
  onSelectProduct,
  onSearchSubmit,
  currency = '৳'
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const cleanWaNumber = (num) => (num ? String(num).replace(/[^0-9]/g, '').replace(/^0/, '880') : '8801855636389');

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search matches
  const trimmedQ = (searchQuery || '').toLowerCase().trim();
  const searchMatches = (trimmedQ && products && products.length > 0)
    ? products.filter(p => 
        (p.title && p.title.toLowerCase().includes(trimmedQ)) ||
        (p.materials && p.materials.toLowerCase().includes(trimmedQ)) ||
        (p.category && p.category.toLowerCase().replace(/-/g, ' ').includes(trimmedQ)) ||
        (p.description && p.description.toLowerCase().includes(trimmedQ))
      ).slice(0, 5)
    : [];

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsSearchFocused(false);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  const handleSuggestionClick = (prod) => {
    setIsSearchFocused(false);
    if (onSelectProduct) onSelectProduct(prod);
  };

  const handleViewAllClick = () => {
    setIsSearchFocused(false);
    if (onSearchSubmit) onSearchSubmit();
  };

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
          padding: '0.85rem 0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div className="container navbar-container">
          {/* 1. Logo & Tagline (Left on Desktop, Top-Left on Mobile) */}
          <div 
            className="navbar-brand"
            onClick={() => setIsAdminMode(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div 
              className="navbar-logo-badge"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(226, 109, 33, 0.28), 0 0 0 2px #e26d21',
                flexShrink: 0,
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              <img
                src={settings?.logo || "/logo.png"}
                alt={settings?.storeName || "Falguni Handcraft"}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1.32)',
                  display: 'block'
                }}
              />
            </div>
            <div>
              <h1 className="navbar-brand-title" style={{ fontSize: '1.75rem', lineHeight: 1.1, color: '#1c1917', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', letterSpacing: '-0.01em', margin: 0 }}>
                <span style={{ color: '#e26d21' }}>Falguni</span> Handcraft
              </h1>
              <span className="navbar-brand-subtitle" style={{ fontSize: '0.74rem', color: '#78716c', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                Aesthetic Bead, Thread & Clay Jewellery
              </span>
            </div>
          </div>

          {/* 2. Search Box with Live Auto-Suggestions Popup */}
          {!isAdminMode && (
            <div 
              ref={searchContainerRef}
              className="navbar-search-wrapper" 
              style={{ position: 'relative' }}
            >
              <Search 
                size={16} 
                onClick={handleViewAllClick}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#e26d21', cursor: 'pointer' }} 
              />
              <input
                type="text"
                placeholder="Search Haldi sets, bracelets, anklets, clay & bead..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                style={{
                  width: '100%',
                  padding: '0.62rem 2.4rem 0.62rem 2.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #d6d0c7',
                  background: '#fbf9f6',
                  color: '#1c1917',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#78716c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              {/* Instant Search Suggestions Dropdown */}
              {isSearchFocused && trimmedQ.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 12px 32px rgba(28, 25, 23, 0.18)',
                  border: '1px solid #e7e2db',
                  zIndex: 999,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.18s ease-out'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '0.6rem 1rem',
                    background: '#faf8f5',
                    borderBottom: '1px solid #e7e2db',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#78716c'
                  }}>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Matching Artisan Items ({searchMatches.length})
                    </span>
                    <span style={{ color: '#e26d21', cursor: 'pointer', fontWeight: 600 }} onClick={handleViewAllClick}>
                      View in gallery ↓
                    </span>
                  </div>

                  {/* List of matched items */}
                  {searchMatches.length > 0 ? (
                    <div>
                      {searchMatches.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => handleSuggestionClick(prod)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.65rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f4efe8',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                        >
                          <img
                            src={prod.image || (prod.images && prod.images[0]) || '/logo.png'}
                            alt={prod.title}
                            style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e7e2db' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '0.85rem', color: '#1c1917', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.title}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: '#78716c', textTransform: 'capitalize' }}>
                              {prod.category?.replace(/-/g, ' ')}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#e26d21' }}>
                            {currency} {prod.price?.toLocaleString()}
                          </span>
                        </div>
                      ))}

                      <div 
                        onClick={handleViewAllClick}
                        style={{
                          padding: '0.65rem 1rem',
                          background: '#faf8f5',
                          textAlign: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#e26d21',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Show all matching items in catalog</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#78716c', fontSize: '0.85rem' }}>
                      <div>No handcrafted items found for "{searchQuery}"</div>
                      <div style={{ fontSize: '0.76rem', color: '#a8a29e', marginTop: '0.25rem' }}>
                        Try searching: <strong>Haldi, Clay, Choker, Payal, Bracelet</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Action Icons & Admin Toggle (Right on Desktop, Top-Right on Mobile) */}
          <div className="navbar-actions">
            {/* Wishlist */}
            <button
              onClick={onToggleWishlist}
              className="btn btn-secondary btn-sm navbar-action-btn"
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
              className="btn btn-primary btn-sm navbar-action-btn"
              style={{ position: 'relative', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', minHeight: '38px' }}
            >
              <ShoppingBag size={17} />
              <span className="navbar-btn-text">Cart</span>
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
              className={isAdminMode ? "btn btn-dark btn-sm navbar-action-btn" : "btn btn-secondary btn-sm navbar-action-btn"}
              style={{
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                border: isAdminMode ? 'none' : '1px solid #d6d0c7',
                padding: '0.5rem 0.85rem',
                minHeight: '38px'
              }}
              title={isAdminMode ? "Switch to Storefront" : "Switch to Admin"}
            >
              {isAdminMode ? (
                <>
                  <Store size={15} /> <span className="navbar-btn-text">Store</span>
                </>
              ) : (
                <>
                  <LayoutDashboard size={15} /> <span className="navbar-btn-text">Admin</span>
                </>
              )}
            </button>
          </div>
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
