import React from 'react';
import { Sparkles, MessageSquare, Box, ArrowRight } from 'lucide-react';

export default function HeroBanner({ categories, onSelectCategory, onScrollToProducts }) {
  return (
    <section style={{
      position: 'relative',
      padding: '3rem 0 2.5rem',
      background: 'linear-gradient(180deg, #faf7f2 0%, #ffffff 100%)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container">
        {/* Main Hero Showcase */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          {/* Left Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.8rem' }}>
              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} color="#c0520d" /> Handcrafted Heritage Collective
              </span>
              <span className="badge" style={{ background: '#1c1917', color: '#ffffff' }}>Artisan Made</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.3rem)',
              lineHeight: 1.15,
              color: '#1c1917',
              marginBottom: '1rem'
            }}>
              Handcrafted jewellery <br />
              <span style={{
                color: '#e26d21',
                fontWeight: 700
              }}>
                woven with traditional & elegance
              </span>
            </h1>

            <p style={{
              fontSize: '1.02rem',
              color: '#57534e',
              marginBottom: '1.8rem',
              maxWidth: '520px',
              lineHeight: 1.65
            }}>
              Exquisitely handcrafted by me, featuring aesthetic seed bead, thread, and clay designs. Discover gorgeous customized Haldi sets for your special day, along with stylish bracelets and anklets. Contact us today to order in your favorite colors and designs!
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={onScrollToProducts}
                className="btn btn-primary"
                style={{ padding: '0.8rem 1.6rem', fontSize: '0.98rem' }}
              >
                Explore Handcrafted Gallery <ArrowRight size={17} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.88rem', fontWeight: 600 }}>
                <MessageSquare size={16} /> WhatsApp Negotiation Available
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginTop: '2.2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e7e2db'
            }}>
              <div>
                <div style={{ color: '#e26d21', fontWeight: 700, fontSize: '1.15rem' }}>3 Photos / Item</div>
                <div style={{ fontSize: '0.78rem', color: '#78716c' }}>Front, side & detail views</div>
              </div>
              <div>
                <div style={{ color: '#15803d', fontWeight: 700, fontSize: '1.15rem' }}>WhatsApp Chat</div>
                <div style={{ fontSize: '0.78rem', color: '#78716c' }}>Direct artisan negotiation</div>
              </div>
              <div>
                <div style={{ color: '#1c1917', fontWeight: 700, fontSize: '1.15rem' }}>100% Artisan</div>
                <div style={{ fontSize: '0.78rem', color: '#78716c' }}>Ethically handmade items</div>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              padding: '0.75rem',
              position: 'relative',
              boxShadow: '0 15px 35px rgba(28, 25, 23, 0.08)',
              border: '1px solid #e7e2db'
            }}>
              <img
                src="https://images.unsplash.com/photo-1611591475847-19069d511977?auto=format&fit=crop&w=900&q=80"
                alt="Handcrafted Jewelry Collection"
                style={{
                  width: '100%',
                  height: '350px',
                  objectFit: 'cover',
                  borderRadius: 'calc(var(--radius-lg) - 6px)'
                }}
              />

              {/* Floating Multi-Photo Badge on Image */}
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #e26d21',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1c1917',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
              }}>
                <Sparkles size={18} color="#e26d21" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 600 }}>Multi-Angle</div>
                  <strong style={{ fontSize: '0.84rem' }}>3 Photos / Item</strong>
                </div>
              </div>

              {/* Bottom Quote Bar */}
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #e7e2db',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#78716c' }}>Artisan Heritage Collection</div>
                  <strong style={{ fontSize: '0.92rem', color: '#1c1917' }}>Terracotta Lotus Choker Set</strong>
                </div>
                <span className="badge" style={{ background: '#e26d21', color: '#ffffff', fontWeight: 700 }}>
                  ৳ 1,450
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar / Grid (inspired by Aarong & geobagbd) */}
        <div style={{ marginTop: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.25rem' }}>Aarong-Inspired Catalog</span>
              <h2 style={{ fontSize: '1.6rem', color: '#1c1917' }}>Explore Curated Handcrafted Categories</h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#78716c' }}>Click any category to filter</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem'
          }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug || cat.id)}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e7e2db',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  position: 'relative',
                  padding: '0.5rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#e26d21';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(226, 109, 33, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e7e2db';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '110px',
                  borderRadius: 'calc(var(--radius-md) - 4px)',
                  overflow: 'hidden',
                  marginBottom: '0.65rem'
                }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: '0.92rem', color: '#1c1917', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#e26d21', fontWeight: 600 }}>
                  {cat.productCount ?? 0} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
