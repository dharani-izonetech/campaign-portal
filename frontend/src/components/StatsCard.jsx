export default function StatsCard({ label, value, icon, accent = 'red', subtitle }) {
  const accents = {
    red:    { bg: 'rgba(204,0,0,0.08)',   icon: '#CC0000',  val: '#CC0000' },
    gold:   { bg: 'rgba(212,160,23,0.1)', icon: '#D4A017',  val: '#b48a12' },
    green:  { bg: 'rgba(22,163,74,0.08)', icon: '#16a34a',  val: '#16a34a' },
    blue:   { bg: 'rgba(37,99,235,0.08)', icon: '#2563eb',  val: '#2563eb' },
    purple: { bg: 'rgba(124,58,237,0.08)',icon: '#7c3aed',  val: '#7c3aed' },
  };
  const c = accents[accent] || accents.red;
  return (
    <div className="card p-4 sm:p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: c.bg, color: c.icon }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>{label}</div>
        <div className="text-2xl font-bold leading-tight mt-0.5" style={{ fontFamily: 'Rajdhani', color: c.val }}>{value}</div>
        {subtitle && <div className="text-xs mt-0.5" style={{ color: '#a1a1aa' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
