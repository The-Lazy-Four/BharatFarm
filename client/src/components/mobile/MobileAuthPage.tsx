import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MorphingSquareLoader } from '../common/MorphingSquareLoader';

interface MobileAuthPageProps {
  mode: 'login' | 'register';
}

export const MobileAuthPage: React.FC<MobileAuthPageProps> = ({ mode }) => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
        setErrorMsg(res.error?.message || t('auth.invalidCredentials'));
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
      width: '100vw',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Top Header Logo & Language Dropdown */}
      <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title={t('common.languageSelect')}
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '20px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        <img
          src="/logo.png"
          alt="BharatFarm"
          style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'contain', marginBottom: '0.5rem' }}
        />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
          {t('common.appName')}
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
              {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.25rem', margin: 0 }}>
              {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
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
                {t('auth.emailOrPhone')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={t('auth.enterEmailOrPhone')}
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
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
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
                  onClick={(e) => { e.preventDefault(); alert(t('auth.passwordResetAlert')); }}
                  style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}
                >
                  {t('auth.forgotPassword')}
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
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isLoading ? (
                <MorphingSquareLoader size={20} color="#FFFFFF" text={t('common.loading')} />
              ) : mode === 'login' ? (
                t('auth.login')
              ) : (
                t('common.register')
              )}
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
            <span>{t('auth.or')}</span>
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
            {mode === 'login' ? t('auth.createNewAccount') : t('auth.signInHere')}
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
        <span>{t('auth.empoweringFarmers')}</span>
      </div>
    </div>
  );
};
