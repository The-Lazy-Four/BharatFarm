import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileAuthPage } from '../../components/mobile/MobileAuthPage';

export const LoginPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
      setErrorMsg(t('auth.invalidCredentials'));
      return;
    }

    if (!password) {
      setErrorMsg(t('auth.invalidCredentials'));
      return;
    }

    setIsLoading(true);
    try {
      const loginEmail = input.includes('@') ? input : `${input.replace(/\D/g, '')}@bharatfarm.org`;
      const res = await login(loginEmail, password);
      if (res.success) {
        navigate('/home', { replace: true });
      } else {
        const code = res.error?.code;
        if (code === 'INVALID_CREDENTIALS') {
          setErrorMsg(t('auth.invalidCredentials'));
        } else if (code === 'VALIDATION_ERROR') {
          setErrorMsg(res.error?.message || t('auth.invalidCredentials'));
        } else {
          setErrorMsg(res.error?.message || t('common.error'));
        }
      }
    } catch {
      setErrorMsg(t('common.error'));
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

      {/* Top Header Logo & Language Selector */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </Link>

        {/* Language Selector Dropdown */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          title={t('common.languageSelect')}
          style={{
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: '20px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <option value="en">English (en-IN)</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="bn">বাংলা (Bengali)</option>
        </select>
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
              {t('auth.loginTitle')}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.35rem', marginBottom: 0 }}>
              {t('auth.loginSubtitle')}
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
                {t('auth.emailOrPhone')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={t('auth.enterEmailOrPhone')}
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
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
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
                <span>{t('auth.rememberMe')}</span>
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert(t('auth.passwordResetAlert')); }} style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>
                {t('auth.forgotPassword')}
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
              {isLoading ? t('common.loading') : t('auth.login')}
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
            <span>{t('auth.or')}</span>
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
            {t('auth.createNewAccount')}
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
          {t('auth.tagline')}
        </div>
      </footer>
    </div>
  );
};
