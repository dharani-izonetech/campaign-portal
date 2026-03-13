import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';

const PLATFORM_LABELS = {
  x_post:       { label:'X Post',   color:'#1a1a1a', bg:'rgba(0,0,0,0.06)' },
  x_retweet:    { label:'Retweet',  color:'#1d9bf0', bg:'rgba(29,155,240,0.08)' },
  facebook_post:{ label:'Facebook', color:'#1877f2', bg:'rgba(24,119,242,0.08)' },
};

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'x_post', label: 'X Post' },
  { id: 'x_retweet', label: 'Retweet' },
  { id: 'facebook_post', label: 'Facebook' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [content, setContent] = useState({ items:[], total:0, page:1, page_size:10, total_pages:1 });
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try { const r = await adminAPI.getStats(); setStats(r.data); } catch {}
  };

  const fetchContent = async (p = 1, f = filter) => {
    setLoading(true);
    try {
      const params = { page: p, page_size: 10 };
      if (f) params.platform = f;
      const r = await adminAPI.getContent(params);
      setContent(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); fetchContent(1, ''); }, []);

  const handleFilter = (f) => { setFilter(f); setPage(1); fetchContent(1, f); };
  const handlePage = (p) => { setPage(p); fetchContent(p, filter); };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm mb-1" style={{ color: '#71717a' }}>{greeting},</div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
          {user?.name} <span style={{ color: '#CC0000' }}>↗</span>
        </h1> 
        <p className="text-sm mt-1" style={{ color: '#71717a' }}>Campaign overview and content management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard label="Total Content" value={stats?.total_content ?? '—'} icon="≡" accent="red" />
        <StatsCard label="Volunteers" value={stats?.total_users ?? '—'} icon="👥" accent="blue" />
        <StatsCard label="Actions Done" value={stats?.total_actions ?? '—'} icon="✓" accent="green" />
        <StatsCard label="X Posts" value={stats?.x_posts ?? '—'} icon="𝕏" accent="gold"
          subtitle={`${stats?.x_retweets ?? 0} retweets · ${stats?.facebook_posts ?? 0} FB`} />
      </div>

      {/* Content table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b" style={{ borderColor: '#e4e4e7' }}>
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani', color: '#111' }}>All Content</h2>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{content.total} total items</p>
          </div>
          {/* Filter toggles */}
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => handleFilter(f.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                style={filter === f.id
                  ? { background: 'linear-gradient(135deg,#CC0000,#990000)', color:'#fff', borderColor:'#CC0000' }
                  : { background: '#fff', color:'#52525b', borderColor:'#d4d4d8' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="shimmer h-10" />)}
            </div>
          ) : content.items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-semibold" style={{ fontFamily: 'Rajdhani', color: '#52525b' }}>No content yet</div>
              <div className="text-sm mt-1" style={{ color: '#71717a' }}>Add content via the sidebar</div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="data-table hidden sm:table">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Content</th>
                    <th className="w-32">Platform</th>
                    <th className="w-36">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {content.items.map((item, idx) => {
                    const pt = PLATFORM_LABELS[item.platform_type] || { label: item.platform_type, color: '#52525b', bg: 'rgba(82,82,91,0.08)' };
                    return (
                      <tr key={item.id}>
                        <td className="font-mono text-xs" style={{ color: '#a1a1aa' }}>
                          {(content.page - 1) * content.page_size + idx + 1}
                        </td>
                        <td>
                          <span className="block max-w-lg truncate" title={item.content}>{item.content}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: pt.bg, color: pt.color }}>{pt.label}</span>
                        </td>
                        <td className="text-xs" style={{ color: '#71717a' }}>
                          {new Date(item.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y" style={{ divideColor: '#f4f4f5' }}>
                {content.items.map((item) => {
                  const pt = PLATFORM_LABELS[item.platform_type] || { label: item.platform_type, color: '#52525b', bg: '#f4f4f5' };
                  return (
                    <div key={item.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="badge text-xs" style={{ background: pt.bg, color: pt.color }}>{pt.label}</span>
                        <span className="text-xs" style={{ color: '#a1a1aa' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: '#27272a' }}>{item.content}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {!loading && content.total > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: '#e4e4e7' }}>
            <Pagination page={content.page} totalPages={content.total_pages}
              total={content.total} pageSize={content.page_size} onPageChange={handlePage} />
          </div>
        )}
      </div>
    </Layout>
  );
}
