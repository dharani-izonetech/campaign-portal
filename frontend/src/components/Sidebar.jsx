import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/admin/upload', label: 'Add Content', icon: '＋' },
  { to: '/admin/upload-excel', label: 'Excel Upload', icon: '⊟' },
  { to: '/admin/progress', label: 'Progress', icon: '◎' },
];

const userLinks = [
  { to: '/dashboard/tasks', label: 'Tasks', icon: '◈' },
  { to: '/dashboard/progress', label: 'My Progress', icon: '◎' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarContent = (
    <aside className="flex flex-col h-full" style={{ background: '#111111', width: '260px' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl"
          style={{ background: 'linear-gradient(135deg, #CC0000, #990000)', fontFamily: 'Rajdhani' }}>
          D
        </div>
        <div>
          <div className="font-bold text-white leading-tight" style={{ fontFamily: 'Rajdhani', fontSize: '1.15rem', letterSpacing: '0.02em' }}>
            Campaign Portal
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#D4A017' }}>
            {isAdmin ? 'Admin Panel' : 'Member Portal'}
          </div>
        </div>
        {/* Close on mobile */}
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white md:hidden" style={{ fontSize: '1.25rem' }}>✕</button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Rajdhani' }}>
          {isAdmin ? 'Management' : 'Campaign'}
        </div>
        {links.map(link => (
          <NavLink
            key={link.to} to={link.to} end={link.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'nav-link-active'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
            style={{ fontFamily: 'Noto Sans' }}
          >
            <span className="text-base w-5 text-center flex-shrink-0">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#CC0000,#990000)', fontFamily: 'Rajdhani' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Rajdhani' }}>{user?.name}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>@{user?.username}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all"
          style={{ color: '#ef4444', fontFamily: 'Noto Sans' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <span>⎋</span> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen z-50" style={{ width: '260px' }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-screen z-50 transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '260px' }}>
        {sidebarContent}
      </div>
    </>
  );
}
