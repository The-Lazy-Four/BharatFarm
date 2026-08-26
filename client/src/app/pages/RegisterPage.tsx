import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

const INDIAN_STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Karnataka',
  'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Odisha', 'Assam'
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('');
  const [role, setRole] = useState('farmer');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        phone: phone.trim() || undefined,
        state,
        district: district.trim() || undefined,
        role
      });

      if (res.success) {
        navigate('/', { replace: true });
      } else {
        const code = res.error?.code;
        if (code === 'DUPLICATE_EMAIL') {
          setErrorMsg('An account with this email address already exists. Please log in.');
        } else if (code === 'VALIDATION_ERROR') {
          setErrorMsg(res.error?.message || 'Please check all required fields and try again.');
        } else {
          setErrorMsg(res.error?.message || 'Unable to register account. Please check your connection and try again.');
        }
      }
    } catch {
      setErrorMsg('Unable to connect right now. Check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Left Visual Branding Panel (Desktop & Tablet) */}
        <div style={{
          flex: '1 1 45%',
          background: `linear-gradient(135deg, rgba(15, 35, 18, 0.90) 0%, rgba(24, 55, 28, 0.85) 100%), url("${heroImageUrl}") center/cover no-repeat`,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          color: '#FFFFFF'
        }} className="auth-hero-panel">
          <img
            src={heroImageUrl}
            alt="BharatFarm Agricultural Landscape"
            onError={() => setImgFailed(true)}
            style={{ display: 'none' }}
          />

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

          <div style={{ marginTop: 'auto', marginBottom: 'auto', maxWidth: '480px', zIndex: 2, padding: '2rem 0' }}>
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
              <span>🤝 Join 100,000+ Smart Farmers</span>
            </span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Start Your Smart Agriculture Journey
            </h1>
            <p style={{ fontSize: '1rem', opacity: 0.95, lineHeight: 1.65, color: '#E2E8F0' }}>
              Register your farm to receive tailored crop advice, local weather alerts, direct access to government schemes, and community group buying deals.
            </p>
          </div>

          <div style={{ fontSize: '0.82rem', opacity: 0.8, borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.25rem', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>© {new Date().getFullYear()} BharatFarm</span>
            <span>Smart India Hackathon Innovation</span>
          </div>
        </div>

        {/* Right Registration Form Card Panel */}
        <div style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          minHeight: '100vh',
          width: '100%',
          overflowY: 'auto'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Mobile-Only Header Brand Banner */}
            <div className="auth-mobile-header" style={{ alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
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

            {/* Header */}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Create Farmer Account
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Enter your details to register as a BharatFarm member.
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ramesh Patel"
                    className="input-field"
                    disabled={isLoading}
                    required
                    style={{ padding: '0.7rem 0.85rem', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9831200001"
                    className="input-field"
                    disabled={isLoading}
                    style={{ padding: '0.7rem 0.85rem', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@bharatfarm.org"
                  className="input-field"
                  disabled={isLoading}
                  required
                  style={{ padding: '0.7rem 0.85rem', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password * (Min. 6 characters)
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
                    style={{ padding: '0.7rem 2.5rem 0.7rem 0.85rem', fontSize: '0.9rem', width: '100%' }}
                  />
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
                      display: 'flex'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-field"
                    disabled={isLoading}
                    style={{ padding: '0.7rem 0.85rem', fontSize: '0.9rem' }}
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ludhiana"
                    className="input-field"
                    disabled={isLoading}
                    style={{ padding: '0.7rem 0.85rem', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Farmer Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                  disabled={isLoading}
                  style={{ padding: '0.7rem 0.85rem', fontSize: '0.9rem' }}
                >
                  <option value="farmer">Smallholder Farmer</option>
                  <option value="commercial_farmer">Commercial Farmer</option>
                  <option value="agri_expert">Agricultural Expert / Advisor</option>
                  <option value="supplier">Input Supplier / Vendor</option>
                </select>
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create BharatFarm Account</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Login Redirect */}
            <div style={{
              textAlign: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-default)',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--emerald-primary)', fontWeight: 700, textDecoration: 'none' }}>
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
