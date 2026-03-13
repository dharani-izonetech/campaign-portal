import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../api';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'x_post', label: 'X Post' },
  { id: 'x_retweet', label: 'Retweet' },
  { id: 'facebook_post', label: 'Facebook' },
];

const PLATFORM_META = {
  x_post:       { icon: '𝕏', label: 'X Post',    color: '#1a1a1a',  bg: 'rgba(0,0,0,0.06)' },
  x_retweet:    { icon: '↺', label: 'Retweet',   color: '#1d9bf0',  bg: 'rgba(29,155,240,0.08)' },
  facebook_post:{ icon: 'f', label: 'Facebook',  color: '#1877f2',  bg: 'rgba(24,119,242,0.08)' },
};

function TaskCard({ task, onComplete }) {
  const meta = PLATFORM_META[task.platform_type] || PLATFORM_META.x_post;

  const handleAction = () => {
    let url = '';
    if (task.platform_type === 'x_post')
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(task.content)}`;
    else if (task.platform_type === 'x_retweet')
      url = task.content.startsWith('http') ? task.content : `https://twitter.com/intent/retweet`;
    else
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(task.content)}`;
    window.open(url, '_blank');
    if (!task.completed) onComplete(task.id);
  };

  return (
    <div className={`card p-4 transition-all hover:shadow-md ${task.completed ? 'opacity-80' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Platform icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 mt-0.5"
          style={{ background: meta.bg, color: meta.color }}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          {/* Badge + status */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            {task.completed && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                ✓ Done
              </span>
            )}
          </div>
          {/* Content */}
          <p className="text-sm leading-relaxed break-words" style={{ color: '#27272a' }}>
            {task.content}
          </p>
        </div>
        {/* Action button */}
        <button onClick={handleAction}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={task.completed
            ? { background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)' }
            : { background: 'linear-gradient(135deg,#CC0000,#990000)', color: '#fff', boxShadow: '0 2px 6px rgba(204,0,0,0.25)' }}>
          {task.platform_type === 'x_retweet'
            ? (task.completed ? 'Retweet Again' : 'Retweet')
            : (task.completed ? 'Post Again' : 'Post')}
        </button>
      </div>
    </div>
  );
}

export default function UserTasks() {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 10, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async (p = page, f = filter) => {
    setLoading(true);
    try {
      const params = { page: p, page_size: 10 };
      if (f) params.platform = f;
      const res = await tasksAPI.getTasks(params);
      setData(res.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(page, filter); }, [page, filter]);

  const handleFilterChange = (f) => { setFilter(f); setPage(1); fetchTasks(1, f); };
  const handlePageChange = (p) => { setPage(p); fetchTasks(p, filter); };

  const handleComplete = async (contentId) => {
    try {
      await tasksAPI.completeTask(contentId);
      setData(prev => ({
        ...prev,
        items: prev.items.map(t => t.id === contentId ? { ...t, completed: true } : t)
      }));
    } catch {}
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>
          Campaign Tasks
        </h1>
        <p className="text-sm mt-1" style={{ color: '#71717a' }}>
          Complete tasks to support the campaign across social media platforms
        </p>
      </div>

      {/* Filter Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => handleFilterChange(f.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all border"
            style={filter === f.id
              ? { background: 'linear-gradient(135deg,#CC0000,#990000)', color: '#fff', borderColor: '#CC0000', boxShadow: '0 2px 8px rgba(204,0,0,0.25)' }
              : { background: '#fff', color: '#52525b', borderColor: '#d4d4d8' }}>
            {f.label}
            {f.id === '' && data.total > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                style={filter === '' ? { background: 'rgba(255,255,255,0.25)' } : { background: 'rgba(204,0,0,0.1)', color: '#CC0000' }}>
                {data.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="shimmer h-24" />)}
        </div>
      ) : data.items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="font-semibold text-lg" style={{ fontFamily: 'Rajdhani', color: '#52525b' }}>No tasks found</div>
          <div className="text-sm mt-1" style={{ color: '#71717a' }}>
            {filter ? 'Try a different filter' : 'No tasks available yet'}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {data.items.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} />
            ))}
          </div>
          <div className="card p-4">
            <Pagination
              page={data.page} totalPages={data.total_pages}
              total={data.total} pageSize={data.page_size}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
