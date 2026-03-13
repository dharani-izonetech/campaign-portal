import { useState, useEffect } from 'react';
import { tasksAPI } from '../api';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';

export default function UserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    tasksAPI.getMyProgress()
      .then(r => setProgress(r.data))
      .finally(() => setLoading(false));
  }, []);

  const pct = progress?.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
          My Progress
        </h1>
        <p className="text-sm mt-1" style={{ color: '#71717a' }}>
          Track your campaign contribution and task completion
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="shimmer h-24 rounded-xl" />)}
          </div>
          <div className="shimmer h-40 rounded-xl" />
        </div>
      ) : progress ? (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatsCard label="Completed"   value={progress.completed}  icon="✓" accent="green" />
            <StatsCard label="Remaining"   value={progress.remaining}  icon="◔" accent="red"   />
            <StatsCard label="Total Tasks" value={progress.total}      icon="≡" accent="blue"  />
            <StatsCard label="Progress"    value={`${pct}%`}           icon="◎" accent="gold"  />
          </div>

          {/* Overall progress bar */}
          <div className="card p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-lg" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
                  Overall Completion
                </div>
                <div className="text-sm mt-0.5" style={{ color: '#71717a' }}>
                  {progress.completed} of {progress.total} tasks completed
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#CC0000' }}>
                {pct}%
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#e4e4e7' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#CC0000,#D4A017)' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: '#71717a' }}>0%</span>
              <span className="text-xs" style={{ color: '#71717a' }}>100%</span>
            </div>
          </div>

          {/* Platform breakdown */}
          <div className="card p-5 sm:p-6 mb-6">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
              Platform Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'X Posts',        count: progress.x_post_count,    icon: '𝕏', color: '#1a1a1a', bg: 'rgba(0,0,0,0.05)' },
                { label: 'Retweets',       count: progress.x_retweet_count, icon: '↺', color: '#1d9bf0', bg: 'rgba(29,155,240,0.08)' },
                { label: 'Facebook Posts', count: progress.facebook_count,  icon: 'f', color: '#1877f2', bg: 'rgba(24,119,242,0.08)' },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: p.bg }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                    style={{ background: '#fff', color: p.color, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani', color: p.color }}>
                      {p.count}
                    </div>
                    <div className="text-xs font-medium" style={{ color: '#71717a' }}>{p.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member info */}
          <div className="card p-5 sm:p-6">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
              Member Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'Full Name',       value: user?.name },
                { label: 'Username',        value: `@${user?.username}` },
                { label: 'Email',           value: user?.email },
                { label: 'Responsibility',  value: user?.responsibility || '—' },
                { label: 'District',        value: user?.district        || '—' },
                { label: 'Constituency',    value: user?.constituency    || '—' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-0.5">
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>
                    {f.label}
                  </div>
                  <div className="text-sm font-medium" style={{ color: '#18181b' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="font-semibold" style={{ fontFamily: 'Rajdhani', color: '#52525b' }}>
            No progress data yet
          </div>
        </div>
      )}
    </Layout>
  );
}
