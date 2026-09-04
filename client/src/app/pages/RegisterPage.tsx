import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileAuthPage } from '../../components/mobile/MobileAuthPage';

const INDIAN_STATES = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Karnataka',
  'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Odisha', 'Assam'
];

export const RegisterPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { register } = useAuth();
  const navigate = useNavigate();

  if (isMobile) {
    return <MobileAuthPage mode="register" />;
  }


  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('');
  const [role] = useState('farmer');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        navigate('/home', { replace: true });
      } else {
        const code = res.error?.code;
        if (code === 'DUPLICATE_EMAIL') {
          setErrorMsg('An account with this email address already exists. Please log in.');
        } else {
          setErrorMsg(res.error?.message || 'Unable to register account. Please check your connection and try again.');
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

      {/* Main Centered Register Box */}
      <main style={{
        width: '100%',
        maxWidth: '480px',
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
              Create New Account
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.35rem', marginBottom: 0 }}>
              Join BharatFarm smart agriculture platform
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
            
            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Patel"
                disabled={isLoading}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@bharatfarm.org"
                  disabled={isLoading}
                  required
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9831200001"
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
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

            {/* State & District */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ludhiana"
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.95rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>
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
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          {/* Footer Login Redirect */}
          <div style={{
            textAlign: 'center',
            paddingTop: '1.25rem',
            marginTop: '1.25rem',
            borderTop: '1px solid #E2E8F0',
            fontSize: '0.9rem',
            color: '#64748B'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>
              Login here
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
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
