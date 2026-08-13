import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../lib/api';
import { Button, Input, PageHeader } from '../components/ui';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function AgentSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setCodeError('Enter an invitation code'); return; }
    setVerifying(true);
    setCodeError('');
    try {
      await post('/api/auth/verify-agent-code', { code: code.trim() });
      setStep(2);
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Invalid code');
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setRegistering(true);
    setError('');
    try {
      await post('/api/auth/register', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        agentCode: code.trim(),
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 448 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-heading)' }}>BT</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>Agent Registration</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Step {step} of 2</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: step >= 1 ? 'var(--color-primary)' : 'var(--color-border)' }} />
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: step >= 2 ? 'var(--color-primary)' : 'var(--color-border)' }} />
        </div>

        {step === 1 ? (
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>Enter Invitation Code</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>Ask your admin for an invitation code</p>
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                placeholder="e.g. AGENT-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={codeError}
              />
              <Button type="submit" loading={verifying} style={{ width: '100%' }}>Verify Code</Button>
            </form>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 16, textAlign: 'center' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>Sign in</a>
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>Create Your Account</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>Code verified! Fill in your details</p>
            {error && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-tint)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 14, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              />
              <Input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              />
              <Button type="submit" loading={registering} style={{ width: '100%' }} icon={UserPlus}>
                Create Account
              </Button>
            </form>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} /> Back to login
        </button>
      </div>
    </div>
  );
}
