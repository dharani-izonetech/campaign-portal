import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import StatsCard from '../components/StatsCard';

const PT = {
  x_post:       { label: 'X Post',   color: '#1a1a1a', bg: 'rgba(0,0,0,0.06)' },
  x_retweet:    { label: 'Retweet',  color: '#1d9bf0', bg: 'rgba(29,155,240,0.08)' },
  facebook_post:{ label: 'Facebook', color: '#1877f2', bg: 'rgba(24,119,242,0.08)' },
};

export default function ProgressTracking() {
  const [tab,         setTab]         = useState('content');
  const [stats,       setStats]       = useState(null);
  const [contentData, setContentData] = useState({ items:[], total:0, page:1, page_size:10, total_pages:1 });
  const [userData,    setUserData]    = useState({ items:[], total:0, page:1, page_size:10, total_pages:1 });
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const [cPage,       setCPage]       = useState(1);
  const [uPage,       setUPage]       = useState(1);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {});
    fetchContent(1);
    fetchUsers(1, '');
  }, []);

  const fetchContent = async (p) => {
    setLoading(true);
    try {
      const r = await adminAPI.getContentProgress({ page: p, page_size: 10 });
      setContentData(r.data);
    } finally { setLoading(false); }
  };

  const fetchUsers = async (p, s) => {
    setLoading(true);
    try {
      const params = { page: p, page_size: 10 };
      if (s) params.search = s;
      const r = await adminAPI.getUserProgress(params);
      setUserData(r.data);
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setUPage(1);
    fetchUsers(1, searchInput);
  };

  const totalCompleted = stats?.total_actions ?? 0;
  const avgPct = stats?.total_users > 0 && stats?.total_content > 0
    ? Math.round((stats.total_actions / (stats.total_users * stats.total_content)) * 100)
    : 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
          Progress Tracking
        </h1>
        <p className="text-sm mt-1" style={{ color: '#71717a' }}>
          Monitor campaign completion across all volunteers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatsCard label="Volunteers"    value={stats?.total_users    ?? '—'} icon="👥" accent="blue"  />
        <StatsCard label="Total Actions" value={totalCompleted}               icon="✓"  accent="green" />
        <StatsCard label="Content Items" value={stats?.total_content  ?? '—'} icon="≡"  accent="red"   />
        <StatsCard label="Avg Completion" value={`${avgPct}%`}                icon="◎"  accent="gold"  />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: '#e4e4e7' }}>
        {[
          { id: 'content', label: 'Content Progress' },
          { id: 'users',   label: 'Volunteer Progress' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === t.id
              ? { background: 'linear-gradient(135deg,#CC0000,#990000)', color: '#fff', boxShadow: '0 2px 8px rgba(204,0,0,0.25)' }
              : { color: '#52525b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content Progress ── */}
      {tab === 'content' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: '#e4e4e7' }}>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani', color: '#111' }}>Content Completion</h2>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{contentData.total} items</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-10" />)}</div>
            ) : (
              <>
                <table className="data-table hidden sm:table">
                  <thead>
                    <tr>
                      <th className="w-12">#</th>
                      <th>Content</th>
                      <th className="w-32">Platform</th>
                      <th className="w-36 text-right">Completed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentData.items.map((item, idx) => {
                      const pt = PT[item.platform_type] || { label: item.platform_type, color: '#52525b', bg: '#f4f4f5' };
                      return (
                        <tr key={item.content_id}>
                          <td className="font-mono text-xs" style={{ color: '#a1a1aa' }}>{(cPage-1)*10+idx+1}</td>
                          <td><span className="block max-w-md truncate" title={item.content}>{item.content}</span></td>
                          <td><span className="badge" style={{ background: pt.bg, color: pt.color }}>{pt.label}</span></td>
                          <td className="text-right">
                            <span className="font-bold" style={{ fontFamily: 'Rajdhani', color: '#16a34a', fontSize: '1.1rem' }}>
                              {item.completed_users}
                            </span>
                            <span className="text-xs ml-1" style={{ color: '#71717a' }}>users</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Mobile cards */}
                <div className="sm:hidden divide-y" style={{ borderColor: '#f4f4f5' }}>
                  {contentData.items.map(item => {
                    const pt = PT[item.platform_type] || { label: item.platform_type, color: '#52525b', bg: '#f4f4f5' };
                    return (
                      <div key={item.content_id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge" style={{ background: pt.bg, color: pt.color }}>{pt.label}</span>
                          <span className="font-bold text-sm" style={{ fontFamily: 'Rajdhani', color: '#16a34a' }}>
                            {item.completed_users} users
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
          {contentData.total > 0 && (
            <div className="px-5 py-4 border-t" style={{ borderColor: '#e4e4e7' }}>
              <Pagination page={cPage} totalPages={contentData.total_pages}
                total={contentData.total} pageSize={contentData.page_size}
                onPageChange={p => { setCPage(p); fetchContent(p); }} />
            </div>
          )}
        </div>
      )}

      {/* ── Volunteer Progress ── */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b" style={{ borderColor: '#e4e4e7' }}>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani', color: '#111' }}>Volunteer Progress</h2>
              <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{userData.total} volunteers</p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search name, district, responsibility…"
                className="input-field w-48 sm:w-64 text-sm py-2"
              />
              <button type="submit" className="btn-dmk px-4 py-2 text-sm flex-shrink-0">Search</button>
            </form>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-10" />)}</div>
            ) : userData.items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">👥</div>
                <div className="font-semibold" style={{ fontFamily: 'Rajdhani', color: '#52525b' }}>No volunteers found</div>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <table className="data-table hidden lg:table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Volunteer</th>
                      <th>Responsibility</th>
                      <th>District</th>
                      <th>Constituency</th>
                      <th className="text-center">Done</th>
                      <th className="text-center">Left</th>
                      <th className="text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.items.map((u, idx) => {
                      const total = u.completed + u.remaining;
                      const pct = total > 0 ? Math.round((u.completed / total) * 100) : 0;
                      return (
                        <tr key={u.user_id}>
                          <td className="font-mono text-xs" style={{ color: '#a1a1aa' }}>{(uPage-1)*10+idx+1}</td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#CC0000,#990000)', fontFamily: 'Rajdhani' }}>
                                {u.name[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-sm" style={{ color: '#18181b' }}>{u.name}</div>
                                <div className="text-xs" style={{ color: '#a1a1aa' }}>@{u.username}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {u.responsibility ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: 'rgba(204,0,0,0.07)', color: '#CC0000' }}>
                                {u.responsibility}
                              </span>
                            ) : <span style={{ color: '#a1a1aa' }}>—</span>}
                          </td>
                          <td style={{ color: '#52525b' }}>{u.district || '—'}</td>
                          <td style={{ color: '#52525b' }}>{u.constituency || '—'}</td>
                          <td className="text-center font-bold" style={{ fontFamily: 'Rajdhani', color: '#16a34a', fontSize: '1rem' }}>{u.completed}</td>
                          <td className="text-center font-bold" style={{ fontFamily: 'Rajdhani', color: '#CC0000',  fontSize: '1rem' }}>{u.remaining}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#e4e4e7' }}>
                                <div className="h-full rounded-full"
                                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#CC0000,#D4A017)' }} />
                              </div>
                              <span className="text-xs w-8 text-right font-mono" style={{ color: '#71717a' }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Tablet/Mobile cards */}
                <div className="lg:hidden divide-y" style={{ borderColor: '#f4f4f5' }}>
                  {userData.items.map(u => {
                    const total = u.completed + u.remaining;
                    const pct = total > 0 ? Math.round((u.completed / total) * 100) : 0;
                    return (
                      <div key={u.user_id} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#CC0000,#990000)', fontFamily: 'Rajdhani' }}>
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm" style={{ color: '#18181b' }}>{u.name}</div>
                            <div className="text-xs" style={{ color: '#a1a1aa' }}>@{u.username}</div>
                            {u.responsibility && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: 'rgba(204,0,0,0.07)', color: '#CC0000' }}>
                                {u.responsibility}
                              </span>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm" style={{ fontFamily: 'Rajdhani', color: '#CC0000' }}>{pct}%</div>
                            <div className="text-xs" style={{ color: '#a1a1aa' }}>{u.district}</div>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: '#e4e4e7' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#CC0000,#D4A017)' }} />
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: '#71717a' }}>
                          <span>{u.completed} done</span>
                          <span>{u.remaining} remaining</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {userData.total > 0 && (
            <div className="px-5 py-4 border-t" style={{ borderColor: '#e4e4e7' }}>
              <Pagination page={uPage} totalPages={userData.total_pages}
                total={userData.total} pageSize={userData.page_size}
                onPageChange={p => { setUPage(p); fetchUsers(p, search); }} />
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
