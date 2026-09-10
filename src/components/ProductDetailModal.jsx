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

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
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
    images.push(images[0] || 'https://images.unsplash.com/photo-1611591475847-19069d511977?auto=format&fit=crop&w=800&q=80');
  }

  const imageLabels = [
    { label: 'Front View', sub: 'Primary Angle' },
    { label: 'Side & Detail', sub: 'Profile Angle' },
    { label: 'Craft & Texture', sub: 'Macro View' }
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

  // WhatsApp direct negotiation link for this product
  const getWhatsAppLink = () => {
    const phone = '8801700000000';
    const text = encodeURIComponent(
      `Hello! I am interested in purchasing this handcrafted item:\n\n` +
      `*Product:* ${product.title}\n` +
      `*Category:* ${product.category}\n` +
      `*Price:* ৳${product.price.toLocaleString()} BDT\n` +
      `*Quantity:* ${quantity}\n` +
      `*Estimated Total:* ৳${(product.price * quantity).toLocaleString()} BDT\n` +
      `*Product Link:* ${window.location.origin}/?product=${product.id}\n\n` +
      `Could you please let me know availability and delivery options?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const getEmailLink = () => {
    const email = 'artisan@handcraftedbd.com';
    const subject = encodeURIComponent(`Order Inquiry: ${product.title}`);
    const body = encodeURIComponent(
      `Hello Artisan Team,\n\nI want to inquire about purchasing:\n\n` +
      `Product: ${product.title}\n` +
      `Price: ৳${product.price} BDT\n` +
      `Quantity: ${quantity}\n\n` +
      `Please provide details on delivery and payment.`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Handcrafted Heritage`,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl my-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#fbf9f6]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-orange-50 text-brand-orange border border-brand-orange-200">
              {product.category?.replace(/-/g, ' ')}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-500">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              100% Artisan Handcrafted
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share product"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors relative"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[11px] bg-stone-800 text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: 3-Picture Gallery (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-[#fdfcfb] flex flex-col border-b lg:border-b-0 lg:border-r border-stone-100">
            {/* Main Image Showcase */}
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-xl overflow-hidden bg-stone-100 shadow-inner group border border-stone-200/80">
              <img
                src={currentImage}
                alt={`${product.title} - View ${activeImageIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-stone-800 shadow-md flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all opacity-80 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-stone-800 shadow-md flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all opacity-80 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Counter & Zoom Hint */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-stone-900/75 backdrop-blur text-white text-xs font-semibold rounded-md shadow">
                  Photo {activeImageIndex + 1} of {images.length}
                </span>
                {discountPercent > 0 && (
                  <span className="px-2.5 py-1 bg-brand-orange text-white text-xs font-bold rounded-md shadow">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-stone-700 rounded-lg shadow text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isZoomed ? 'Reset' : 'Zoom'}</span>
              </button>
            </div>

            {/* 3 Dedicated Picture Thumbnails */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  3 Separate Views
                </span>
                <span className="text-xs text-brand-orange font-medium">
                  Click to switch view
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {images.slice(0, 3).map((imgUrl, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left bg-white shadow-sm ${
                        isActive
                          ? 'border-brand-orange ring-2 ring-brand-orange/20 shadow-md'
                          : 'border-stone-200 hover:border-brand-orange/60 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                        <img
                          src={imgUrl}
                          alt={`View ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 bg-[#fcfbfa] border-t border-stone-100">
                        <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-brand-orange' : 'text-stone-800'}`}>
                          {imageLabels[idx]?.label || `Photo ${idx + 1}`}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {imageLabels[idx]?.sub || 'Angle'}
                        </p>
                      </div>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-orange" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Stock */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
                  Handcrafted Artisan Series
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock || 10} units)
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-3">
                {product.title}
              </h2>

              {/* Price Section */}
              <div className="flex items-baseline gap-3 pb-4 mb-4 border-b border-stone-100">
                <span className="text-3xl font-bold text-brand-orange">
                  ৳{product.price?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-stone-400 line-through">
                    ৳{product.originalPrice?.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-stone-500 font-medium ml-auto">
                  BDT (Negotiable via WhatsApp)
                </span>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Artisan Story & Description
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {product.description ||
                    'Every curve and color of this piece is hand-shaped and painted by traditional Bengali artisans. Created with meticulous passion, ensuring genuine uniqueness.'}
                </p>
              </div>

              {/* Craftsmanship & Materials */}
              <div className="p-3.5 bg-[#fbf9f6] rounded-xl border border-stone-200/80 mb-5 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="font-semibold text-stone-800">Materials:</span>
                  <span className="text-stone-600">{product.materials || 'Pure Organic Clay & Silk Thread'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="font-semibold text-stone-800">Artisan Guarantee:</span>
                  <span className="text-stone-600">100% Eco-friendly, Hand-sculpted</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="font-semibold text-stone-800">Crafting Time:</span>
                  <span className="text-stone-600">3-4 Days per unique piece</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Quantity:
                </span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-stone-800 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  Total: <strong className="text-stone-900 font-bold">৳{(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart (৳{(product.price * quantity).toLocaleString()})
              </button>

              {/* Direct WhatsApp Negotiation */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Negotiate & Order on WhatsApp
              </a>

              {/* Email Inquiry */}
              <a
                href={getEmailLink()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                Send Inquiry via Email
              </a>

              {/* Trust Indicators */}
              <div className="pt-3 flex items-center justify-center gap-4 text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Safe Packaging
                </span>
                <span>•</span>
                <span>Fast Courier in Bangladesh</span>
                <span>•</span>
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
