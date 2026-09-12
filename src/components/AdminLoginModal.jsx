import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, X, Sparkles } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email/username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Successful login
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleFillSuperAdminDemo = () => {
    setEmail('shawon.cse.ku@gmail.com');
    setPassword('superadmin123');
    setError('');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(226, 109, 33, 0.15)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
          padding: '1.4rem 1.6rem',
          color: '#f5f5f4',
          position: 'relative',
          borderBottom: '2px solid #e26d21'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#d6d3d1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#d6d3d1'; }}
            title="Close"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#e26d21',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(226, 109, 33, 0.35)'
            }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fed7aa', fontWeight: 600 }}>
                Secure Access
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Admin Portal Login
              </h2>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#a8a29e' }}>
            Enter your administrative credentials to manage products, categories, orders, and website settings.
          </p>
        </div>

        {/* Body & Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.6rem' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '1.2rem'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Username */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.45rem'
            }}>
              Email or Username
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}>
                <Mail size={16} />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. shawon.cse.ku@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '0.68rem 1rem 0.68rem 2.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#e26d21'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#374151'
              }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.68rem 2.5rem 0.68rem 2.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#e26d21'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.78rem',
              backgroundColor: '#e26d21',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(226, 109, 33, 0.3)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#c0520d'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#e26d21'; }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Super Admin Quick Helper Pill */}
          <div style={{
            marginTop: '1.4rem',
            padding: '0.85rem',
            background: '#faf8f5',
            borderRadius: '10px',
            border: '1px dashed #e7e2db',
            fontSize: '0.78rem',
            color: '#78716c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: '#1c1917', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={13} color="#e26d21" /> Default Super Admin:
              </span>
              <button
                type="button"
                onClick={handleFillSuperAdminDemo}
                style={{
                  background: '#fff',
                  border: '1px solid #d6d0c7',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#e26d21',
                  cursor: 'pointer'
                }}
              >
                Auto-fill
              </button>
            </div>
            <div>Email: <code style={{ color: '#1c1917', background: '#f5f5f4', padding: '1px 4px', borderRadius: '3px' }}>shawon.cse.ku@gmail.com</code></div>
            <div>Password: <code style={{ color: '#1c1917', background: '#f5f5f4', padding: '1px 4px', borderRadius: '3px' }}>superadmin123</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}
