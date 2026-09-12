/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import React from 'react';
import { Sparkles, MessageSquare, Box, ArrowRight } from 'lucide-react';

export default function HeroBanner({ categories, onSelectCategory, onScrollToProducts, featuredProduct, onSelectProduct, settings }) {
  const cleanWaNumber = (num) => (num ? String(num).replace(/[^0-9]/g, '').replace(/^0/, '880') : '8801855636389');
  
  return (
    <section 
      className="hero-section"
      style={{
        position: 'relative',
        padding: '3rem 0 2.5rem',
        background: 'linear-gradient(180deg, #faf7f2 0%, #ffffff 100%)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="container">
        {/* Main Hero Showcase */}
        <div className="hero-main-grid">
          {/* Left Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} color="#c0520d" /> Handcrafted Heritage Collective
              </span>
              <span className="badge" style={{ background: '#1c1917', color: '#ffffff' }}>Artisan Made</span>
            </div>

            <h1 className="hero-title" style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.3rem)',
              lineHeight: 1.15,
              color: '#1c1917',
              marginBottom: '1rem'
            }}>
              Handcrafted jewellery <br />
              <span style={{ color: '#e26d21' }}>woven with tradition</span>
            </h1>

            <p className="hero-description" style={{
              fontSize: '1.05rem',
              color: '#57534e',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginBottom: '1.75rem'
            }}>
              Exquisitely handcrafted seed bead necklaces, vibrant thread chokers, and terracotta bridal Haldi sets. Browse, customize your sizing, and connect directly with our artisans.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={onScrollToProducts}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.98rem' }}
              >
                Explore Handcrafted Gallery <ArrowRight size={17} />
              </button>

              <a
                href={`https://wa.me/${cleanWaNumber(settings?.whatsappNumber)}?text=${encodeURIComponent("Hello Falguni Handcraft! I would like to talk with you about your jewelry.")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  color: '#15803d',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '0.7rem 1.15rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#dcfce7';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f0fdf4';
                }}
              >
                <MessageSquare size={16} /> WhatsApp Inquiry
              </a>
            </div>
          </div>

          {/* Right Visual Showcase Card */}
          <div
            onClick={() => onSelectProduct && featuredProduct && onSelectProduct(featuredProduct)}
            style={{ position: 'relative', cursor: onSelectProduct ? 'pointer' : 'default', width: '100%' }}
          >
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              padding: '0.65rem',
              position: 'relative',
              boxShadow: '0 15px 35px rgba(28, 25, 23, 0.08)',
              border: '1px solid #e7e2db',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(226, 109, 33, 0.16)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(28, 25, 23, 0.08)';
            }}
            >
              <img
                src={featuredProduct?.image || "/terracotta-lotus-choker.jpg"}
                alt={featuredProduct?.title || "Terracotta Lotus Choker Set"}
                className="hero-image-box"
                fetchPriority="high"
                decoding="async"
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  borderRadius: 'calc(var(--radius-lg) - 6px)',
                  display: 'block'
                }}
              />

              {/* Floating Multi-Photo Badge on Image */}
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #e26d21',
                borderRadius: 'var(--radius-md)',
                padding: '0.4rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#1c1917',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
              }}>
                <Sparkles size={16} color="#e26d21" />
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 600 }}>Multi-Angle</div>
                  <strong style={{ fontSize: '0.8rem' }}>3 Photos / Item</strong>
                </div>
              </div>

              {/* Bottom Quote Bar */}
              <div 
                className="hero-quote-bar"
                style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  left: '1.25rem',
                  right: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #e7e2db',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ maxWidth: '60%' }}>
                  <div style={{ fontSize: '0.72rem', color: '#78716c', textTransform: 'capitalize' }}>
                    {featuredProduct?.category ? featuredProduct.category.replace(/-/g, ' ') : 'Artisan Heritage'}
                  </div>
                  <strong style={{
                    fontSize: '0.88rem',
                    color: '#1c1917',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {featuredProduct?.title || 'Terracotta Lotus Choker Set'}
                  </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="badge" style={{ background: '#e26d21', color: '#ffffff', fontWeight: 700, padding: '0.25rem 0.5rem' }}>
                    ৳ {featuredProduct?.price ? featuredProduct.price.toLocaleString() : '1,450'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#e26d21', fontWeight: 600 }}>View Photos →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar / Grid (inspired by Aarong & geobagbd) */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div>
              <h2 className="category-showcase-title" style={{ fontSize: '1.55rem', color: '#1c1917' }}>
                Explore Curated Handcrafted Categories
              </h2>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#78716c' }}>Tap any category to filter</span>
          </div>

          <div className="category-showcase-grid">
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
                <div 
                  className="category-card-img-wrap"
                  style={{
                    width: '100%',
                    height: '110px',
                    borderRadius: 'calc(var(--radius-md) - 4px)',
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: '0.88rem', color: '#1c1917', marginBottom: '0.15rem', fontWeight: 600 }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#e26d21', fontWeight: 600 }}>
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
