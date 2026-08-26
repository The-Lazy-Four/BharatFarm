import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        navigate('/', { replace: true });
      } else {
        const code = res.error?.code;
        if (code === 'INVALID_CREDENTIALS') {
          setErrorMsg('Email or password is incorrect. Please check and try again.');
        } else if (code === 'VALIDATION_ERROR') {
          setErrorMsg(res.error?.message || 'Please provide a valid email and password.');
        } else {
          setErrorMsg(res.error?.message || 'Unable to connect right now. Check your internet connection and try again.');
        }
      }
    } catch {
      setErrorMsg('Unable to connect right now. Check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--surface-bg)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Theme Toggle Top Bar */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 20 }}>
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
      </div>

      {/* Main Container Layout */}
      <div style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh'
      }}>
        {/* Left Visual Branding Panel (Desktop Only) */}
        <div style={{
          flex: '1 1 50%',
          background: 'linear-gradient(135deg, rgba(20, 40, 20, 0.92) 0%, rgba(30, 65, 35, 0.85) 100%), url("/assets/bg2-1FrgOhjU.jpg") center/cover no-repeat',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'between',
          padding: '3rem',
          position: 'relative',
          color: '#FFFFFF'
        }} className="app-sidebar">
          {/* Top Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--signal-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--text-on-lime)' }}>
                agriculture
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>BharatFarm</h2>
              <span style={{ fontSize: '0.75rem', color: '#A3E635', fontWeight: 600 }}>Smart Farmer AI</span>
            </div>
          </div>

          {/* Center Agricultural Value Message */}
          <div style={{ marginTop: 'auto', marginBottom: 'auto', maxWidth: '480px' }}>
            <span className="badge badge-primary" style={{ background: 'rgba(163, 230, 53, 0.2)', color: '#A3E635', border: '1px solid rgba(163, 230, 53, 0.4)', padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginBottom: '1.25rem', display: 'inline-block' }}>
              🌾 Empowering Indian Agriculture
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF', marginBottom: '1rem' }}>
              Your Digital Farming Companion
            </h1>
            <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: 1.6, color: '#E2E8F0' }}>
              Access AI crop disease diagnostics, hyper-local weather advisory, group buying discounts, and government schemes in one unified platform.
            </p>
          </div>

          {/* Bottom Footer Details */}
          <div style={{ fontSize: '0.8rem', opacity: 0.7, borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.5rem' }}>
            © {new Date().getFullYear()} BharatFarm. Smart India Hackathon Innovation.
          </div>
        </div>

        {/* Right Form Card Panel */}
        <div style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Header / Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--signal-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--text-on-lime)' }}>
                    agriculture
                  </span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>BharatFarm</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Sign in to manage your crops, advisory, and farm records.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="alert-danger" style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                fontSize: '0.85rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@bharatfarm.org"
                    className="input-field"
                    disabled={isLoading}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      fontSize: '0.95rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: 'var(--text-muted)'
                  }}>mail</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    disabled={isLoading}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      fontSize: '0.95rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: 'var(--text-muted)'
                  }}>lock</span>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined spin" style={{ fontSize: '20px' }}>sync</span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Redirect */}
            <div style={{
              textAlign: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-default)',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: 'var(--emerald-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
