import { useState } from 'react';
import { adminAPI } from '../api';
import Layout from '../components/Layout';

const PLATFORMS = [
  { value:'x_post',        label:'X Post',       icon:'𝕏', desc:'Tweet content to X/Twitter' },
  { value:'x_retweet',     label:'X Retweet',    icon:'↺', desc:'Retweet a tweet by URL' },
  { value:'facebook_post', label:'Facebook Post', icon:'f', desc:'Share on Facebook' },
];

export default function ContentUpload() {
  const [form, setForm] = useState({ content: '', platform_type: 'x_post' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await adminAPI.createContent(form);
      setSuccess('Content added successfully!');
      setForm(f => ({ ...f, content: '' }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add content');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>Add Content</h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>Manually create a new campaign task</p>
        </div>

        {/* Platform picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {PLATFORMS.map(p => (
            <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, platform_type: p.value }))}
              className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
              style={form.platform_type === p.value
                ? { borderColor: '#CC0000', background: 'rgba(204,0,0,0.04)' }
                : { borderColor: '#e4e4e7', background: '#fff' }}>
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="font-bold text-sm" style={{ fontFamily: 'Rajdhani', color: form.platform_type === p.value ? '#CC0000' : '#18181b' }}>
                {p.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#71717a' }}>{p.desc}</div>
            </button>
          ))}
        </div>

        <div className="card p-5 sm:p-6">
          {error && <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#52525b' }}>
                Content {form.platform_type === 'x_retweet' ? '(Tweet URL)' : '(Text)'}
              </label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={form.platform_type === 'x_retweet'
                  ? 'https://twitter.com/user/status/123456789'
                  : 'Enter campaign message…'}
                rows={5} className="input-field resize-none" required />
              <div className="text-right mt-1 text-xs" style={{ color: '#a1a1aa' }}>{form.content.length} chars</div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm" style={{ color: '#71717a' }}>
                Platform: <span className="font-semibold" style={{ color: '#CC0000' }}>
                  {PLATFORMS.find(p => p.value === form.platform_type)?.label}
                </span>
              </div>
              <button type="submit" disabled={loading || !form.content.trim()} className="btn-dmk w-full sm:w-auto">
                {loading ? 'Adding…' : '+ Add Content'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
