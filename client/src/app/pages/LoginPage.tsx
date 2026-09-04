import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileAuthPage } from '../../components/mobile/MobileAuthPage';

export const LoginPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { login } = useAuth();
  const navigate = useNavigate();

  if (isMobile) {
    return <MobileAuthPage mode="login" />;
  }


  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const input = emailOrPhone.trim();
    if (!input) {
      setErrorMsg('Please enter your email or phone number.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      // If phone input, append mock domain if not email format for login API compatibility
      const loginEmail = input.includes('@') ? input : `${input.replace(/\D/g, '')}@bharatfarm.org`;
      const res = await login(loginEmail, password);
      if (res.success) {
        navigate('/home', { replace: true });
      } else {
        const code = res.error?.code;
        if (code === 'INVALID_CREDENTIALS') {
          setErrorMsg('Email/phone or password is incorrect. Please check and try again.');
        } else if (code === 'VALIDATION_ERROR') {
          setErrorMsg(res.error?.message || 'Please provide valid login credentials.');
        } else {
          setErrorMsg(res.error?.message || 'Unable to connect right now. Check your internet connection.');
        }
      }
    } catch {
      setErrorMsg('Unable to connect right now. Check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      
      {/* Top Header Logo */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#FFFFFF' }}>agriculture</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </Link>
      </header>

      {/* Main Centered Login Box */}
      <main style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        padding: '0 1.5rem',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '2.25rem 2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Welcome Back!
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.35rem', marginBottom: 0 }}>
              Login to continue your journey
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Email or Phone Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Email or Phone
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email or phone number"
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: '#94A3B8'
                }}>person</span>
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: '#94A3B8'
                }}>lock</span>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ borderRadius: '4px', accentColor: '#16A34A' }}
                />
                <span>Remember me</span>
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email/phone.'); }} style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
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
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1.5rem 0',
            color: '#94A3B8',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {/* Create New Account Button */}
          <Link
            to="/register"
            style={{
              display: 'block',
              width: '100%',
              padding: '0.8rem',
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#15803D',
              border: '1.5px solid #16A34A',
              fontWeight: 800,
              fontSize: '0.95rem',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            Create New Account
          </Link>
        </div>
      </main>

      {/* Soft Agriculture Field Illustration Footer */}
      <footer style={{
        marginTop: '3rem',
        padding: '2rem 1rem 1rem',
        background: 'linear-gradient(180deg, rgba(248,250,252,0) 0%, #DCFCE7 100%)',
        textAlign: 'center',
        borderTop: '1px solid #E2E8F0'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 800, letterSpacing: '0.05em' }}>
          Grow • Learn • Prosper
        </div>
      </footer>
    </div>
  );
};
