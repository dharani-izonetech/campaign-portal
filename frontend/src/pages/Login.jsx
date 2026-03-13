import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.access_token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard/tasks');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between w-[420px] lg:w-[480px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #CC0000 0%, #990000 60%, #111111 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #fff 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl"
              style={{ fontFamily: 'Rajdhani' }}>D</div>
            <div className="text-white font-bold text-xl" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.04em' }}>
              CAMPAIGN PORTAL
            </div>
          </div>
          <div>
            <div className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: 'Rajdhani' }}>
              Together We Rise
            </div>
            <h2 className="text-white font-bold leading-tight mb-4" style={{ fontFamily: 'Rajdhani', fontSize: '2.5rem' }}>
              Coordinate. Campaign. Conquer.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              The unified platform for managing and tracking social media campaigns across all districts and constituencies.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10" style={{ background: '#f4f4f5' }}>
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg,#CC0000,#990000)' }}>
              <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Rajdhani' }}>D</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>DMK Campaign HQ</h1>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Rajdhani', color: '#111' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: '#71717a' }}>Sign in to your campaign account</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm border" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#52525b' }}>
                Username or Email
              </label>
              <input type="text" value={form.identifier}
                onChange={e => setForm({...form, identifier: e.target.value})}
                placeholder="Enter username or email"
                className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#52525b' }}>Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Enter your password"
                className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-dmk w-full py-3 text-base mt-2">
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#71717a' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#CC0000' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
