import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

// ─────────────────────────────────────────────────────────────────────────────
// Field is defined OUTSIDE Register so React never recreates it between renders.
// Defining it inside would cause React to treat it as a new component type on
// every keystroke → unmount + remount every input → focus lost immediately.
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: '#52525b' }}
      >
        {label}{required && <span style={{ color: '#CC0000' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const RESPONSIBILITY_SUGGESTIONS = [
  'District Secretary',
  'Union Secretary',
  'Youth Wing Organizer',
  'Ward Incharge',
  'Booth Committee Member',
  'Women Wing Secretary',
  'Student Wing Leader',
  'Volunteer',
];

export default function Register() {
  const [form, setForm] = useState({
    name:           '',
    username:       '',
    email:          '',
    password:       '',
    district:       '',
    constituency:   '',
    responsibility: '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Single stable updater — no inline arrow functions that recreate on render
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestion = (val) => {
    setForm((prev) => ({ ...prev, responsibility: val }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Always register as regular user; role is set server-side
      await authAPI.register({ ...form, role: 'user' });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-4"
      style={{ background: '#f4f4f5' }}
    >
      <div className="w-full max-w-lg animate-slide-up">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#CC0000,#990000)' }}
          >
            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Rajdhani' }}>D</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
            Create Account
          </h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>
            Join the DMK Campaign Platform
          </p>
        </div>

        {/* ── Card ── */}
        <div className="card p-6 md:p-8">

          {/* Alerts */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-lg text-sm border"
              style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-5 px-4 py-3 rounded-lg text-sm border"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name + Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input-field"
                  autoComplete="name"
                  required
                />
              </Field>
              <Field label="Username" required>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="input-field"
                  autoComplete="username"
                  required
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email Address" required>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input-field"
                autoComplete="email"
                required
              />
            </Field>

            {/* Password */}
            <Field label="Password" required>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="input-field"
                autoComplete="new-password"
                required
              />
            </Field>

            {/* District + Constituency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="District">
                <input
                  name="district"
                  type="text"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  className="input-field"
                />
              </Field>
              <Field label="Constituency">
                <input
                  name="constituency"
                  type="text"
                  value={form.constituency}
                  onChange={handleChange}
                  placeholder="e.g. Thousand Lights"
                  className="input-field"
                />
              </Field>
            </div>

            {/* Responsibility — free-text with suggestion chips */}
            <Field label="Responsibility / Designation">
              <input
                name="responsibility"
                type="text"
                value={form.responsibility}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. District Secretary, Ward Incharge…"
                className="input-field"
                autoComplete="off"
              />
              {/* Quick-pick chips */}
              {showSuggestions && (
                <div
                  className="mt-2 p-2 rounded-lg border flex flex-wrap gap-1.5"
                  style={{ background: '#fafafa', borderColor: '#e4e4e7' }}
                >
                  {RESPONSIBILITY_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => handleSuggestion(s)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 border"
                      style={{
                        background: form.responsibility === s ? 'rgba(204,0,0,0.08)' : '#fff',
                        borderColor: form.responsibility === s ? '#CC0000' : '#d4d4d8',
                        color:       form.responsibility === s ? '#CC0000' : '#52525b',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs mt-1.5" style={{ color: '#a1a1aa' }}>
                Type freely or pick a suggestion above
              </p>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-dmk w-full py-3 text-base mt-2"
            >
              {loading ? 'Creating Account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#71717a' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#CC0000' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
