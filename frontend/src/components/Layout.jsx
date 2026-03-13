import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#f4f4f5' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="md:ml-[260px] min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30 border-b"
          style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={() => setMobileOpen(true)} className="text-white text-xl p-1">☰</button>
          <div className="font-bold text-white text-base" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.02em' }}>
            DMK Campaign HQ
          </div>
          <div className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#CC0000,#990000)', fontFamily: 'Rajdhani' }}>
            D
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
