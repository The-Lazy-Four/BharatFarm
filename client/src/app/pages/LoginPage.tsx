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
  const [imgFailed, setImgFailed] = useState(false);

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

  // High quality Unsplash agricultural photo with fallback
  const heroImageUrl = imgFailed
    ? '/assets/bg2-1FrgOhjU.jpg'
    : 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80';

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
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 30 }}>
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
        flexDirection: 'row',
        width: '100%',
        minHeight: '100vh'
      }}>
        {/* Left Visual Branding Hero Panel (Desktop & Tablet) */}
        <div style={{
          flex: '1 1 50%',
          background: `linear-gradient(135deg, rgba(15, 35, 18, 0.90) 0%, rgba(24, 55, 28, 0.85) 100%), url("${heroImageUrl}") center/cover no-repeat`,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          color: '#FFFFFF'
        }} className="auth-hero-panel">
          {/* Fallback image handler */}
          <img
            src={heroImageUrl}
            alt="BharatFarm Agricultural Landscape"
            onError={() => setImgFailed(true)}
            style={{ display: 'none' }}
          />

          {/* Top Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--signal-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(163, 230, 53, 0.4)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: 'var(--text-on-lime)' }}>
                agriculture
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: '#FFFFFF' }}>BharatFarm</h2>
              <span style={{ fontSize: '0.78rem', color: '#A3E635', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Smart Farmer AI</span>
            </div>
          </div>

          {/* Center Farmer Value Proposition */}
          <div style={{ marginTop: 'auto', marginBottom: 'auto', maxWidth: '520px', zIndex: 2, padding: '2rem 0' }}>
            <span className="badge" style={{
              background: 'rgba(163, 230, 53, 0.25)',
              color: '#A3E635',
              border: '1px solid rgba(163, 230, 53, 0.45)',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '20px'
            }}>
              <span>🌾 Built for Indian Farmers</span>
            </span>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Empowering Every Field With Intelligence
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.95, lineHeight: 1.65, color: '#E2E8F0', fontWeight: 400 }}>
              Connect with instant AI crop disease diagnostics, hyper-local weather advisory, direct government scheme applications, and community group buying power.
            </p>

            {/* Feature highlights bullets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '2rem' }}>
              {[
                { icon: 'energy_savings_leaf', text: 'AI Crop Diagnostic' },
                { icon: 'partly_cloudy_day', text: 'Live Weather Advisory' },
                { icon: 'groups', text: 'Group Buying Savings' },
                { icon: 'account_balance', text: 'PM-KISAN & Schemes' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '8px', backdropFilter: 'blur(8px)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#A3E635' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer Attribution */}
          <div style={{ fontSize: '0.82rem', opacity: 0.8, borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.25rem', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>© {new Date().getFullYear()} BharatFarm</span>
            <span>Smart India Hackathon Innovation</span>
          </div>
        </div>

        {/* Right Authentication Form Container */}
        <div style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          minHeight: '100vh',
          width: '100%'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Mobile-Only Header Brand Banner */}
            <div className="auth-mobile-header" style={{ alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--signal-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-on-lime)' }}>
                  agriculture
                </span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>BharatFarm</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--emerald-primary)', fontWeight: 700 }}>Smart Farmer AI</span>
              </div>
            </div>

            {/* Title Block */}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Farmer Sign In
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                Enter your credentials to access crop diagnostics, weather alerts, and group buying discounts.
              </p>
            </div>

            {/* Error Banner */}
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
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
                    <span>Sign In to BharatFarm</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Redirect */}
            <div style={{
              textAlign: 'center',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-default)',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              New to BharatFarm?{' '}
              <Link to="/register" style={{ color: 'var(--emerald-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Register your farm here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
