import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface MobileAuthPageProps {
  mode: 'login' | 'register';
}

export const MobileAuthPage: React.FC<MobileAuthPageProps> = ({ mode }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const input = emailOrPhone.trim();
    if (!input) {
      setErrorMsg('Please enter your email or phone.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const loginEmail = input.includes('@') ? input : `${input.replace(/\D/g, '')}@bharatfarm.org`;
      const res = await login(loginEmail, password);
      if (res.success) {
        navigate('/home', { replace: true });
      } else {
        setErrorMsg(res.error?.message || 'Login failed. Please check credentials.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Top Header Logo */}
      <div style={{ padding: '2rem 1.5rem 0', textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(22, 163, 74, 0.25)',
          marginBottom: '0.5rem'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#FFFFFF' }}>agriculture</span>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
          BharatFarm
        </h1>
      </div>

      {/* Main Login Form Container */}
      <div style={{ padding: '0 1.25rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.75rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.25rem', margin: 0 }}>
              {mode === 'login' ? 'Login to continue to BharatFarm' : 'Join 1M+ smart farmers across India'}
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Email or Phone
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email or phone"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: '#94A3B8'
                }}>person</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: '#94A3B8'
                }}>lock</span>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Password reset requested'); }}
                  style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isLoading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                marginTop: '0.25rem'
              }}
            >
              {isLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.25rem 0',
            color: '#94A3B8',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span>or</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          <Link
            to={mode === 'login' ? '/register' : '/login'}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#15803D',
              border: '1.5px solid #16A34A',
              fontWeight: 800,
              fontSize: '0.9rem',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            {mode === 'login' ? 'Create New Account' : 'Login to Existing Account'}
          </Link>
        </div>
      </div>

      {/* Soft Leaf/Farm Illustration Bottom */}
      <div style={{
        padding: '1.5rem 1rem',
        background: 'linear-gradient(180deg, rgba(248,250,252,0) 0%, #DCFCE7 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#15803D',
        fontSize: '0.85rem',
        fontWeight: 700
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>eco</span>
        <span>Empowering Farmers with Technology</span>
      </div>
    </div>
  );
};
