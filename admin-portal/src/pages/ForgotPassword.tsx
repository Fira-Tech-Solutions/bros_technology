import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../lib/api';
import { Button, Input } from '../components/ui';
import { ArrowLeft, Mail, Check } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 448 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-heading)' }}>BT</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>Forgot Password</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Enter your email to reset your password</p>
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} style={{ color: 'var(--color-success)' }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>Check your email</h2>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                If an account exists with <strong>{email}</strong>, a 6-digit reset code has been sent.
              </p>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}>
                  Enter Reset Code
                </Button>
                <Button variant="secondary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-tint)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 14, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
                  {error}
                </div>
              )}
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" loading={loading} style={{ width: '100%' }}>
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} /> Back to login
        </button>
      </div>
    </div>
  );
}
