export default function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <div className="text-xs" style={{ color: '#71717a' }}>
        Showing {from}–{to} of {total} items
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)} disabled={page === 1}
          className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg border text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-600"
          style={{ borderColor: '#d4d4d8', color: '#52525b' }}>
          «
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-600"
          style={{ borderColor: '#d4d4d8', color: '#52525b' }}>
          ‹
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onPageChange(p)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all"
            style={p === page
              ? { background: 'linear-gradient(135deg,#CC0000,#990000)', borderColor: '#CC0000', color: '#fff' }
              : { borderColor: '#d4d4d8', color: '#52525b' }}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-600"
          style={{ borderColor: '#d4d4d8', color: '#52525b' }}>
          ›
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
          className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg border text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-600"
          style={{ borderColor: '#d4d4d8', color: '#52525b' }}>
          »
        </button>
      </div>
    </div>
  );
}
