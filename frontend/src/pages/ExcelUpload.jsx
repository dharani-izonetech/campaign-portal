import { useState, useRef } from 'react';
import { adminAPI } from '../api';
import Layout from '../components/Layout';

const PLATFORMS = [
  { value:'x_post',        label:'X Post',       icon:'𝕏' },
  { value:'x_retweet',     label:'X Retweet',    icon:'↺' },
  { value:'facebook_post', label:'Facebook Post', icon:'f' },
];

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('x_post');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f); setError('');
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('platform_type', platform);
      const res = await adminAPI.uploadExcel(fd);
      setResult(res.data); setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Rajdhani', color: '#111' }}>Excel Upload</h1>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>Bulk upload campaign tasks via spreadsheet</p>
        </div>

        {/* Format guide */}
        <div className="card p-5 mb-6" style={{ borderLeft: '4px solid #CC0000' }}>
          <h3 className="font-bold mb-3" style={{ fontFamily: 'Rajdhani', color: '#111' }}>📋 Required Format</h3>
          <p className="text-sm mb-3" style={{ color: '#52525b' }}>
            Your Excel file must have a column named <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(204,0,0,0.08)', color: '#CC0000' }}>content</code>. Each row is one task.
          </p>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#e4e4e7' }}>
            <table className="w-full text-sm">
              <thead style={{ background: '#fafafa' }}>
                <tr><th className="text-left px-4 py-2 font-semibold text-xs uppercase tracking-wider" style={{ color: '#71717a' }}>content</th></tr>
              </thead>
              <tbody>
                {['Support our campaign today!','Join the rally in Chennai','https://x.com/user/status/123456'].map((r,i) => (
                  <tr key={i} className="border-t" style={{ borderColor: '#f4f4f5' }}>
                    <td className="px-4 py-2 text-sm" style={{ color: '#27272a' }}>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 sm:p-6 space-y-5">
          {error && <div className="p-3 rounded-lg text-sm border" style={{ background:'#fef2f2', borderColor:'#fecaca', color:'#dc2626' }}>{error}</div>}
          {result && (
            <div className="p-4 rounded-lg border" style={{ background:'#f0fdf4', borderColor:'#bbf7d0', color:'#16a34a' }}>
              <div className="font-bold">✓ Upload Successful!</div>
              <div className="text-sm mt-1">{result.count} tasks added to the platform</div>
            </div>
          )}

          {/* Platform */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#52525b' }}>
              Platform Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map(p => (
                <button key={p.value} onClick={() => setPlatform(p.value)}
                  className="py-2.5 px-3 rounded-lg border font-semibold text-sm transition-all"
                  style={platform === p.value
                    ? { borderColor:'#CC0000', background:'rgba(204,0,0,0.06)', color:'#CC0000' }
                    : { borderColor:'#d4d4d8', background:'#fff', color:'#52525b' }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#52525b' }}>Excel File</label>
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}
              onClick={()=>fileRef.current.click()}
              className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
              style={dragging
                ? { borderColor:'#CC0000', background:'rgba(204,0,0,0.04)' }
                : { borderColor:'#d4d4d8', background:'#fafafa' }}>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={e=>handleFile(e.target.files[0])} />
              {file ? (
                <>
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-semibold text-sm" style={{ color:'#16a34a' }}>{file.name}</div>
                  <div className="text-xs mt-1" style={{ color:'#a1a1aa' }}>{(file.size/1024).toFixed(1)} KB · Click to change</div>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📂</div>
                  <div className="text-sm" style={{ color:'#52525b' }}>
                    Drop your Excel file here, or <span style={{ color:'#CC0000', fontWeight:600 }}>browse</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color:'#a1a1aa' }}>Supports .xlsx and .xls files</div>
                </>
              )}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !file} className="btn-dmk w-full py-3">
            {loading ? 'Uploading…' : '↑ Upload Excel File'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
