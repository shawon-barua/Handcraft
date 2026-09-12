import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Maximize2,
  Package,
  Clock
} from 'lucide-react';

export default function ProductDetailModal({ product, settings, isOpen, onClose, onAddToCart }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setIsZoomed(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Ensure 3 images array
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image, product.image, product.image].filter(Boolean);

  while (images.length < 3) {
    images.push(images[0] || '/terracotta-lotus-choker.jpg');
  }

  const imageLabels = [
    { label: 'Front Overview', sub: 'Primary Angle' },
    { label: 'Macro Details', sub: 'Close-Up View' },
    { label: 'Matching Earrings', sub: 'Craft & Profile' }
  ];

  const currentImage = images[activeImageIndex] || images[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const whatsappNumber = (settings?.whatsappNumber || '8801855636389').replace(/[^0-9]/g, '').replace(/^0/, '880');
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hello Falguni Handcraft! I am interested in ordering this handcrafted item:\n\n` +
      `*Product:* ${product.title}\n` +
      `*Price:* ৳${product.price.toLocaleString()} BDT\n` +
      `*Quantity:* ${quantity}\n` +
      `*Estimated Total:* ৳${(product.price * quantity).toLocaleString()} BDT\n\n` +
      `Please let me know how we can proceed with colors and delivery!`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  const getEmailLink = () => {
    const email = settings?.email || 'falgunihandcraft@gmail.com';
    const subject = encodeURIComponent(`Order Inquiry: ${product.title}`);
    const body = encodeURIComponent(
      `Hello Falguni Handcraft,\n\nI want to inquire about purchasing:\n\n` +
      `Product: ${product.title}\n` +
      `Price: ৳${product.price} BDT\n` +
      `Quantity: ${quantity}\n\n` +
      `Please provide details on delivery and custom color options.`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Falguni Handcraft`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content product-detail-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '94vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1px solid #e7e2db'
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e7e2db',
          background: '#faf8f5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
              {product.category?.replace(/-/g, ' ')}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} color="#e26d21" /> 100% Artisan Handcrafted
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleShare}
              title="Share product"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid #d6d0c7',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1c1917',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Share2 size={16} color="#1c1917" />
              {copied && (
                <span style={{
                  position: 'absolute',
                  bottom: '-1.8rem',
                  right: 0,
                  fontSize: '0.7rem',
                  background: '#1c1917',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}>
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              title="Close modal"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid #d6d0c7',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1c1917',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="#1c1917" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="product-detail-grid">
          {/* Left Column: 3-Picture Gallery */}
          <div className="product-detail-gallery-col" style={{
            padding: '1.5rem',
            background: '#fcfbfa',
            borderRight: '1px solid #e7e2db',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Main Image Showcase */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#f5f3ee',
              border: '1px solid #e7e2db'
            }}>
              <img
                src={currentImage}
                alt={`${product.title} - View ${activeImageIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                  transform: isZoomed ? 'scale(1.4)' : 'scale(1)',
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                }}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrev}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid #e7e2db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid #e7e2db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronRight size={20} />
              </button>

              {/* Badge Counter */}
              <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                <span style={{
                  background: 'rgba(28, 25, 23, 0.82)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px'
                }}>
                  Photo {activeImageIndex + 1} of {images.length}
                </span>
                {discountPercent > 0 && (
                  <span className="badge" style={{ background: '#e26d21', color: '#fff', fontWeight: 700 }}>
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Zoom Button */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  right: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '4px',
                  border: '1px solid #e7e2db',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer'
                }}
              >
                <Maximize2 size={13} /> {isZoomed ? 'Reset' : 'Zoom'}
              </button>
            </div>

            {/* 3 Dedicated Picture Thumbnails */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                <strong style={{ color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  3 High-Definition Angles
                </strong>
                <span style={{ color: '#e26d21', fontWeight: 600 }}>Click to switch angle</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {images.slice(0, 3).map((imgUrl, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: isActive ? '2px solid #e26d21' : '1.5px solid #e7e2db',
                        background: '#ffffff',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isActive ? '0 0 0 2px rgba(226, 109, 33, 0.2)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ width: '100%', height: '62px', overflow: 'hidden' }}>
                        <img
                          src={imgUrl}
                          alt={`View ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '0.35rem 0.45rem', background: '#faf8f5', borderTop: '1px solid #e7e2db' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? '#e26d21' : '#1c1917' }}>
                          {imageLabels[idx]?.label || `Photo ${idx + 1}`}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#78716c' }}>
                          {imageLabels[idx]?.sub || 'Angle'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div 
            className="product-detail-info-col"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* Category & Stock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e26d21', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Handcrafted Artisan Series
                </span>
                <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
                  <CheckCircle2 size={13} /> In Stock ({product.stock || 14} units)
                </span>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: '1.45rem', lineHeight: 1.25, color: '#1c1917', marginBottom: '0.75rem' }}>
                {product.title}
              </h2>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid #e7e2db' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e26d21' }}>
                  ৳ {product.price?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span style={{ fontSize: '1.05rem', color: '#a8a29e', textDecoration: 'line-through' }}>
                    ৳ {product.originalPrice?.toLocaleString()}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: '#78716c', marginLeft: 'auto' }}>
                  BDT (Direct Order / Inquiries via WhatsApp)
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.1rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#78716c', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                  Artisan Craftsmanship & Story
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#57534e', lineHeight: 1.6 }}>
                  {product.description || 'Intricately hand-sculpted river clay medallion with hand-painted lotus petals using natural waterproof pigments, suspended on rich crimson resham silk thread with adjustable bead slider.'}
                </p>
              </div>

              {/* Craftsmanship Specifications */}
              <div style={{
                background: '#faf8f5',
                border: '1px solid #e7e2db',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                marginBottom: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={15} color="#e26d21" />
                  <strong style={{ color: '#1c1917' }}>Materials:</strong>
                  <span style={{ color: '#57534e' }}>{product.materials || 'Baked Terracotta, Resham Silk Thread, Brass Beads'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={15} color="#e26d21" />
                  <strong style={{ color: '#1c1917' }}>Quality:</strong>
                  <span style={{ color: '#57534e' }}>100% Eco-Friendly Clay, Waterproof Polish</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} color="#e26d21" />
                  <strong style={{ color: '#1c1917' }}>Crafting Time:</strong>
                  <span style={{ color: '#57534e' }}>3-4 Days of meticulous artisan effort</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#57534e' }}>
                  Quantity:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d6d0c7', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.4rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0.4rem 0.85rem', fontWeight: 700, fontSize: '0.9rem', minWidth: '2.5rem', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                    style={{ padding: '0.4rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#78716c' }}>
                  Total: <strong style={{ color: '#1c1917' }}>৳ {(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '1rem', borderTop: '1px solid #e7e2db' }}>
              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                <ShoppingBag size={18} /> Add to Cart (৳ {(product.price * quantity).toLocaleString()})
              </button>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                <MessageCircle size={18} /> Talk with Us by WhatsApp
              </a>

              <a
                href={getEmailLink()}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
              >
                <Mail size={16} /> Send Email Inquiry
              </a>

              {/* Delivery info */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.72rem', color: '#a8a29e', marginTop: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Package size={13} /> Eco-safe gift pack
                </span>
                <span>•</span>
                <span>Home Delivery All Over Bangladesh</span>
                <span>•</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
