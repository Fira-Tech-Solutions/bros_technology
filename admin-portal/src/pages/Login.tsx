import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, Lock, Eye, EyeOff, Package, BarChart3, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 14px 0 44px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ═══ LEFT PANEL — BRAND ═══ */}
      <div
        className="hidden lg:flex"
        style={{
          width: '50%',
          background: 'linear-gradient(160deg, #1878B4 0%, #125E8C 40%, #0D4F75 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 72px',
        }}
      >
        {/* Dot pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage:
              'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 48,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 22, fontFamily: 'var(--font-heading)' }}>BT</span>
          </div>

          {/* Title */}
          <h1
            style={{
              color: '#fff',
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.1,
              fontFamily: 'var(--font-heading)',
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            Bros Technology
            <br />
            Admin Portal
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 17,
              lineHeight: 1.6,
              maxWidth: 420,
              marginBottom: 56,
              fontFamily: 'var(--font-body)',
            }}
          >
            Manage products, agents, and Telegram syndication from one centralized dashboard.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: Package, text: 'Manage 500+ products across 5 categories' },
              { icon: BarChart3, text: 'Real-time asset stats and commissions' },
              { icon: Shield, text: 'Agent code generation and management' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="#fff" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontFamily: 'var(--font-body)' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — FORM ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '16px 24px',
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 18,
              color: 'var(--color-text-muted)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px 64px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ marginBottom: 32 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>BT</span>
              </div>
            </div>

            {/* Heading */}
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text)',
                marginBottom: 8,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                marginBottom: 40,
              }}
            >
              Sign in to your admin account
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: 24,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger-tint)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  fontSize: 14,
                  color: 'var(--color-danger)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: 8,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@brostechnology.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="email"
                    style={{
                      ...inputBase,
                      borderColor: focusedField === 'email' ? 'var(--color-primary)' : 'var(--color-border)',
                      background: focusedField === 'email' ? 'var(--color-surface)' : 'var(--color-bg)',
                      boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(24,120,180,0.1)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: 8,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="current-password"
                    style={{
                      ...inputBase,
                      paddingRight: 44,
                      borderColor: focusedField === 'password' ? 'var(--color-primary)' : 'var(--color-border)',
                      background: focusedField === 'password' ? 'var(--color-surface)' : 'var(--color-bg)',
                      boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(24,120,180,0.1)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 4,
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: loading ? '#93C5FD' : 'var(--color-primary)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all var(--transition-fast)',
                  boxShadow: loading ? 'none' : '0 1px 3px rgba(24,120,180,0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'var(--color-primary-dark)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24,120,180,0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(24,120,180,0.3)';
                  }
                }}
                onMouseDown={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Links */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <a
                href="/forgot-password"
                style={{
                  fontSize: 14,
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  display: 'inline-block',
                  marginBottom: 16,
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              >
                Forgot password?
              </a>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                Need an agent account?{' '}
                <a
                  href="/agent-signup"
                  style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
