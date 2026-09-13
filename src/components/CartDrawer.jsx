/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
  onOpenDetail,
  currency = '৳'
}) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="cart-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          background: '#ffffff',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 25px rgba(28, 25, 23, 0.1)',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#faf8f5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="#e26d21" />
            <h2 style={{ fontSize: '1.25rem', color: '#1c1917' }}>
              Your Handcrafted Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #d6d0c7',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1c1917',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body / Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {cart.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(217, 119, 6, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)'
              }}>
                <ShoppingBag size={32} color="var(--primary-light)" />
              </div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '1.2rem' }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '280px', marginBottom: '1.5rem' }}>
                Explore our handcrafted clay, thread, bangles, and men's bracelets to begin your artisan order.
              </p>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Browse Handcrafted Collection
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    padding: '0.85rem',
                    background: '#fbf9f6',
                    border: '1px solid #e7e2db',
                    borderRadius: 'var(--radius-sm)',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      cursor: onOpenDetail ? 'pointer' : 'default'
                    }}
                    onClick={() => onOpenDetail && onOpenDetail(item)}
                    title="Click to view product details"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 
                      onClick={() => onOpenDetail && onOpenDetail(item)}
                      style={{
                        fontSize: '0.9rem',
                        color: '#1c1917',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '0.2rem',
                        cursor: onOpenDetail ? 'pointer' : 'default',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={e => { if (onOpenDetail) e.currentTarget.style.color = '#e26d21'; }}
                      onMouseLeave={e => { if (onOpenDetail) e.currentTarget.style.color = '#1c1917'; }}
                      title="Click to view product details"
                    >
                      {item.title}
                    </h4>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c0520d', marginBottom: '0.4rem' }}>
                      {currency} {item.price?.toLocaleString()}
                    </div>

                    {/* Quantity Stepper in Cart */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: '1px solid #d6d0c7',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#44403c',
                            padding: '0.2rem 0.45rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontSize: '0.8rem', padding: '0 0.4rem', fontWeight: 700, color: '#1c1917' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#44403c',
                            padding: '0.2rem 0.45rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.3rem'
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: '#c0520d' }}>
                    {currency} {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={onClearCart}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#78716c',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear all items
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            background: '#faf8f5'
          }}>
            {/* Direct Negotiation Note */}
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              color: '#9a3412',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <MessageSquare size={16} color="#e26d21" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Zero On-site Payment:</strong> Checkout directly sends your cart items to our WhatsApp or Email for custom negotiation, sizing & direct order confirmation.
              </div>
            </div>

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <span style={{ fontSize: '1rem', color: '#57534e' }}>Subtotal:</span>
              <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#c0520d' }}>
                {currency} {subtotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={onProceedCheckout}
              className="btn btn-whatsapp"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              <MessageSquare size={18} /> Checkout via WhatsApp / Email <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
