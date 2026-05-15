import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseFile, transformData } from '../services/importParser';

const MODULE_LABELS = {
  inventory: 'Inventory', suppliers: 'Suppliers', purchaseOrders: 'Purchase Orders', salesOrders: 'Sales Orders',
};

export default function DataImportModal({ moduleType, onImport, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [transformed, setTransformed] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef();

  const handleFile = async (f) => {
    setFile(f); setError(''); setPreview(null); setTransformed([]); setLoading(true);
    try {
      const { headers, rows } = await parseFile(f);
      if (rows.length === 0) { setError('File is empty or has no data rows'); setLoading(false); return; }
      setPreview({ headers, rows: rows.slice(0, 5), total: rows.length });
      const data = transformData(headers, rows, moduleType);
      setTransformed(data);
    } catch (e) { setError(e.message || 'Failed to parse file'); }
    setLoading(false);
  };

  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const handleConfirm = () => { onImport(transformed); setDone(true); setTimeout(onClose, 1200); };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-title">📥 Import {MODULE_LABELS[moduleType] || 'Data'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <CheckCircle size={48} color="var(--green)" />
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12, color: 'var(--green)' }}>
                {transformed.length} record(s) imported successfully!
              </div>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', cursor: 'pointer', background: 'var(--bg3)', transition: 'all 0.2s' }}
                onDragEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(0,166,81,0.05)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}>
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.json" hidden onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
                <Upload size={32} color="var(--text3)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {file ? file.name : 'Drag & drop file here or click to browse'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  Supports: Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
                </div>
              </div>

              {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)' }}>Parsing file...</div>}
              {error && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 12, background: 'rgba(200,16,46,0.1)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      <FileSpreadsheet size={14} style={{ display: 'inline', marginRight: 4 }} />
                      Preview ({preview.total} rows total, showing first 5)
                    </span>
                    <span className="badge badge-green">{transformed.length} mappable</span>
                  </div>
                  <div className="table-wrap" style={{ maxHeight: 250, overflow: 'auto' }}>
                    <table>
                      <thead><tr>{preview.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                      <tbody>
                        {preview.rows.map((row, ri) => (
                          <tr key={ri}>
                            {preview.headers.map((h, ci) => <td key={ci} style={{ fontSize: 12 }}>{row[h] ?? ''}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!done && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={transformed.length === 0} onClick={handleConfirm}>
              <Upload size={13} /> Import {transformed.length} Record(s)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
