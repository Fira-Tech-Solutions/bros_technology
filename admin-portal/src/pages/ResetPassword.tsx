import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../lib/api';
import { Button, Input } from '../components/ui';
import { ArrowLeft, Lock, Check, Mail } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !token) {
      setError('Email and reset code are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await post('/api/auth/reset-password', { email, token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Reset failed');
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>Reset Password</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Create a new password for your account</p>
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} style={{ color: 'var(--color-success)' }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>Password reset!</h2>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Your password has been updated</p>
              <div style={{ marginTop: 16 }}>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                  Sign In
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
              <Input
                label="Reset Code"
                type="text"
                icon={Lock}
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
              />
              <Input
                label="New Password"
                type="password"
                icon={Lock}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" loading={loading} style={{ width: '100%' }}>
                Reset Password
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
