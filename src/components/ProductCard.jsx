/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import React, { useState } from 'react';
import { ShoppingCart, Heart, Images, Check, MessageSquare, Star, Plus, Minus, Eye } from 'lucide-react';

export default function ProductCard({
  product,
  currency = '৳',
  onAddToCart,
  onOrderNow,
  onOpenDetail,
  isWishlisted,
  onToggleWishlist
}) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // 3 pictures available
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image, product.image, product.image].filter(Boolean);

  const displayImage = isHovered && images[1] ? images[1] : (images[0] || product.image);

  return (
    <div
      className="product-card group"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={e => {
        setIsHovered(true);
        e.currentTarget.style.borderColor = '#e26d21';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(226, 109, 33, 0.12)';
      }}
      onMouseLeave={e => {
        setIsHovered(false);
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Image & Badges Container */}
      <div
        style={{ position: 'relative', width: '100%', paddingTop: '82%', overflow: 'hidden', background: '#f5f3ee', cursor: 'pointer' }}
        onClick={() => onOpenDetail && onOpenDetail(product)}
      >
        <img
          src={displayImage}
          alt={`${product.title} - Handcrafted Jewelry Bangladesh`}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease, opacity 0.3s ease'
          }}
          className="group-hover:scale-105"
        />

        {/* Badges on Top Left */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 2 }}>
          {discountPercent && (
            <span className="badge" style={{ background: '#e26d21', color: '#fff', fontWeight: 700 }}>
              {discountPercent}% OFF
            </span>
          )}
          {product.badges && product.badges.map((b, i) => (
            <span key={i} className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
              {b}
            </span>
          ))}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 2,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isWishlisted ? '#e26d21' : '#44403c',
            transition: 'var(--transition)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} fill={isWishlisted ? '#e26d21' : 'none'} />
        </button>

        {/* 3 Photos Pill Button on Bottom Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail && onOpenDetail(product);
          }}
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            zIndex: 2,
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            color: '#1c1917',
            border: '1px solid rgba(226, 109, 33, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title="View 3 separate high-res photos"
        >
          <Images size={13} color="#e26d21" />
          <span>3 Photos</span>
        </button>

        {/* 3 Photo Indicator dots on bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          zIndex: 2,
          display: 'flex',
          gap: '4px',
          background: 'rgba(28, 25, 23, 0.65)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: (isHovered && i === 1) || (!isHovered && i === 0) ? '#e26d21' : 'rgba(255, 255, 255, 0.6)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#e26d21', fontWeight: 600 }}>
            {product.category?.replace(/-/g, ' ')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#d97706' }}>
            <Star size={13} fill="#d97706" />
            <span style={{ fontWeight: 600, color: '#44403c' }}>{product.rating || '5.0'}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.02rem',
            lineHeight: 1.35,
            color: '#1c1917',
            marginBottom: '0.4rem',
            minHeight: '2.7rem',
            cursor: 'pointer'
          }}
          onClick={() => onOpenDetail && onOpenDetail(product)}
        >
          {product.title}
        </h3>

        {/* Materials Note */}
        <p style={{
          fontSize: '0.78rem',
          color: '#78716c',
          marginBottom: '0.85rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5
        }}>
          🧵 {product.materials || product.description}
        </p>

        {/* Price Row */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#c0520d' }}>
            {currency} {product.price?.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: '#a8a29e' }}>
              {currency} {product.originalPrice?.toLocaleString()}
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
            In Stock ({product.stock || 10})
          </span>
        </div>

        {/* Quantity Selector + Add to Cart + Order Now */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Quantity stepper & Add to Cart row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Quantity Stepper */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f5f3ee',
              border: '1px solid #d6d0c7',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}>
              <button
                onClick={handleDecrement}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#44403c',
                  padding: '0.5rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: '#1c1917' }}>
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#44403c',
                  padding: '0.5rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: '0.55rem 0.8rem',
                fontSize: '0.85rem',
                background: justAdded ? '#ecfdf5' : '#ffffff',
                borderColor: justAdded ? '#059669' : '#d6d0c7',
                color: justAdded ? '#059669' : '#1c1917'
              }}
            >
              {justAdded ? (
                <>
                  <Check size={15} color="#059669" /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={15} /> Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Quick Buy Now / Negotiate via WhatsApp */}
          <button
            onClick={() => onOrderNow(product, quantity)}
            className="btn btn-whatsapp"
            style={{ width: '100%', padding: '0.55rem', fontSize: '0.88rem' }}
          >
            <MessageSquare size={15} /> Order on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
