import React, { useState } from 'react';
import { X, MessageSquare, Mail, CheckCircle2, Sparkles, MapPin, Phone, User, FileText, ArrowRight } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  currency = '৳',
  settings,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (channel = 'whatsapp') => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your WhatsApp or contact phone number.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter your delivery street address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      let order = null;
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: formData,
            items: cart,
            channel: channel,
            totalAmount: subtotal
          })
        });

        if (response.ok) {
          order = await response.json();
        }
      } catch (err) {
        console.warn('Backend order recording skipped (running in static/offline mode):', err);
      }

      // Generate graceful client fallback order ID if backend is offline/static
      if (!order) {
        order = {
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          customer: formData,
          items: cart,
          channel: channel,
          totalAmount: subtotal,
          status: 'Direct Message',
          createdAt: new Date().toISOString()
        };
      }

      setCompletedOrder(order);

      // 2. Format detailed message for WhatsApp or Email
      const itemsListText = cart
        .map((item, idx) => `${idx + 1}. ${item.title} (x${item.quantity}) - ${currency}${item.price * item.quantity}`)
        .join('\n');

      const ownerWhatsApp = (settings?.whatsappNumber || '8801855636389').replace(/[^0-9]/g, '').replace(/^0/, '880');
      const ownerEmail = settings?.email || 'falgunihandcraft@gmail.com';

      if (channel === 'whatsapp') {
        const waMessage = 
`✨ *NEW HANDCRAFTED ORDER & INQUIRY* ✨
🔖 *Order Ref:* #${order.id}
👤 *Customer:* ${formData.name}
📱 *Phone:* ${formData.phone}
📍 *Address:* ${formData.address}, ${formData.city}
📝 *Customization Request:* ${formData.notes ? formData.notes : 'Standard handcrafted sizing'}

🛍️ *ORDERED CART ITEMS:*
${itemsListText}

💰 *Subtotal:* ${currency} ${subtotal.toLocaleString()}

Hello Falguni Handcraft! I placed this order from your website. Please check my items and let's finalize the order and delivery details!`;

        const waUrl = `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(waMessage)}`;
        window.open(waUrl, '_blank');
      } else {
        const emailSubject = encodeURIComponent(`New Handcrafted Order Inquiry - #${order.id} (${formData.name})`);
        const emailBody = encodeURIComponent(
`Order Reference: #${order.id}
Customer Name: ${formData.name}
Phone: ${formData.phone}
Delivery Address: ${formData.address}, ${formData.city}
Customization Note: ${formData.notes || 'None'}

Cart Items:
${itemsListText}

Total Estimated Amount: ${currency} ${subtotal.toLocaleString()}

Hello, I would like to talk with you and confirm this order.`);
        
        window.open(`mailto:${ownerEmail}?subject=${emailSubject}&body=${emailBody}`, '_self');
      }

      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Could not record order. Please verify your connection or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', background: '#ffffff' }}>
        {/* Header */}
        <div style={{
          padding: '1rem clamp(0.9rem, 3.5vw, 1.5rem)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#faf8f5'
        }}>
          <div>
            <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
              <Sparkles size={12} color="#c0520d" /> Direct WhatsApp / Email Negotiation
            </span>
            <h2 style={{ fontSize: '1.35rem', color: '#1c1917' }}>
              {completedOrder ? 'Order Sent Successfully!' : 'Handcrafted Order Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #d6d0c7',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
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

        {/* Content Area */}
        <div style={{ padding: 'clamp(0.9rem, 3.5vw, 1.5rem)' }}>
          {completedOrder ? (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid rgba(5, 150, 105, 0.4)'
              }}>
                <CheckCircle2 size={40} color="#34d399" />
              </div>

              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Inquiry Placed with Reference #{completedOrder.id}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Your cart details and customization requests have been recorded in our Admin Panel and forwarded to our artisan team. We will review your requirements on WhatsApp!
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left',
                maxWidth: '440px',
                margin: '0 auto 1.5rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{completedOrder.customer?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone / WhatsApp:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{completedOrder.customer?.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery City:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{completedOrder.customer?.city}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <strong style={{ color: '#fcd34d', fontSize: '1.05rem' }}>{currency} {completedOrder.totalAmount?.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${(settings?.whatsappNumber || '8801855636389').replace(/[^0-9]/g, '').replace(/^0/, '880')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <MessageSquare size={16} /> Open WhatsApp Chat
                </a>
                <button onClick={onClose} className="btn btn-secondary">
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <div>
              {/* Order Cart Quick Summary */}
              <div style={{
                background: '#faf8f5',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                border: '1px solid #e7e2db',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#78716c' }}>Ordering {totalItems} item(s):</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1c1917', marginTop: '0.2rem' }}>
                    {cart.slice(0, 2).map(i => i.title).join(', ')}
                    {cart.length > 2 && ` + ${cart.length - 2} more`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#78716c' }}>Subtotal</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c0520d' }}>
                    {currency} {subtotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1.1rem'
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={14} /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Nusrat Jahan"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Phone size={14} /> WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. 01819234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> Delivery Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="House, Road, Area (e.g. House 24, Road 7, Dhanmondi)"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / District *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Outside Bangladesh">International</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FileText size={14} /> Customization & Negotiation Note (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Wrist size 6.5 inches, prefer maroon silk thread, need delivery before next Friday, etc."
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>

              {/* Checkout Channel Buttons */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.25rem',
                marginTop: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCheckout('whatsapp')}
                  className="btn btn-whatsapp"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                >
                  <MessageSquare size={18} /> Send Cart to WhatsApp and Talk with Us
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCheckout('email')}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
                >
                  <Mail size={16} /> Send Cart via Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
