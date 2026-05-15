import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Plus, Search, Edit2, Trash2, Star, X, Zap, Globe, Mail, Phone, Award } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';

const statusColors = { active: 'green', suspended: 'red', pending: 'yellow', inactive: 'gray' };

function SupplierModal({ supplier, onSave, onClose }) {
  const [form, setForm] = useState(supplier || { id: `SUP${String(Date.now()).slice(-3)}`, name: '', category: '', country: '', contact: '', email: '', phone: '', status: 'pending', score: 70, totalOrders: 0, onTimeRate: 0, defectRate: 0, spend: 0, since: new Date().toISOString().split('T')[0], payment: 'Net 30', certified: false });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{supplier ? 'Edit Supplier' : 'Add Supplier'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Company Name</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select...</option>
                {['Electronics','Packaging','Freight','Medical','IT Equipment','Food & Beverage','Raw Materials','Consumer Goods'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Country</label><input className="form-control" value={form.country} onChange={e => set('country', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {['active','pending','suspended','inactive'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Contact Person</label><input className="form-control" value={form.contact} onChange={e => set('contact', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Payment Terms</label>
              <select className="form-control" value={form.payment} onChange={e => set('payment', e.target.value)}>
                {['Net 15','Net 30','Net 45','Net 60'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Performance Score (0-100)</label><input className="form-control" type="number" min={0} max={100} value={form.score} onChange={e => set('score', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">On-Time Rate (%)</label><input className="form-control" type="number" min={0} max={100} value={form.onTimeRate} onChange={e => set('onTimeRate', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Defect Rate (%)</label><input className="form-control" type="number" step="0.1" value={form.defectRate} onChange={e => set('defectRate', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Total Spend ($)</label><input className="form-control" type="number" value={form.spend} onChange={e => set('spend', Number(e.target.value))} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
            <input type="checkbox" id="cert" checked={form.certified} onChange={e => set('certified', e.target.checked)} />
            <label htmlFor="cert" style={{ fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>ISO Certified Supplier</label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{supplier ? 'Save Changes' : 'Add Supplier'}</button>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 85 ? 'var(--green)' : score >= 70 ? '#eab308' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score * 0.94} 94`} strokeLinecap="round" transform="rotate(-90 18 18)" />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const { state, dispatch, notify } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table | cards

  const filtered = state.suppliers.filter(s => {
    const ms = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(ms) || s.category.toLowerCase().includes(ms) || s.country.toLowerCase().includes(ms);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const save = (form) => {
    if (modal === 'new') { dispatch({ type: 'ADD_SUPPLIER', payload: form }); notify('Supplier added successfully', 'success'); }
    else { dispatch({ type: 'UPDATE_SUPPLIER', payload: form }); notify('Supplier updated', 'success'); }
    setModal(null);
  };
  const del = (id) => { dispatch({ type: 'DELETE_SUPPLIER', payload: id }); notify('Supplier removed', 'error'); };

  return (
    <div>
      {modal && <SupplierModal supplier={modal === 'new' ? null : modal} onSave={save} onClose={() => setModal(null)} />}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Supplier Management</div>
          <div className="page-sub">Vendor relationships, performance scoring and qualification</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowAI(!showAI)}><Zap size={14} /> Intelligence</button>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> Add Supplier</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Suppliers', value: state.suppliers.length, color: 'blue' },
          { label: 'Active', value: state.suppliers.filter(s => s.status === 'active').length, color: 'green' },
          { label: 'Avg Score', value: Math.round(state.suppliers.reduce((s, x) => s + x.score, 0) / state.suppliers.length), color: 'yellow' },
          { label: 'Total Spend', value: `$${(state.suppliers.reduce((s, x) => s + x.spend, 0) / 1000).toFixed(0)}K`, color: 'red' },
        ].map((k, i) => (
          <div key={i} className={`stat-card ${k.color}`}>
            <span className="stat-label">{k.label}</span>
            <div className="stat-value">{k.value}</div>
          </div>
        ))}
      </div>

      {showAI && <div className="card" style={{ marginBottom: 20 }}><AIAssistant context={{ suppliers: state.suppliers }} /></div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--text3)" />
            <input placeholder="Search by name, category, country..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs">
            {['all', 'active', 'pending', 'suspended'].map(s => (
              <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
          <div className="tabs">
            <button className={`tab ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
            <button className={`tab ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>Cards</button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Category</th><th>Country</th><th>Score</th><th>On-Time</th><th>Defect Rate</th><th>Total Spend</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `hsl(${s.id.charCodeAt(3) * 20}, 60%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {s.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.id}</div>
                        </div>
                        {s.certified && <Award size={12} color="var(--green)" title="ISO Certified" />}
                      </div>
                    </td>
                    <td><span className="tag">{s.category}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{s.country}</td>
                    <td><ScoreBadge score={s.score} /></td>
                    <td>
                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 6, minWidth: 80 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${s.onTimeRate}%`, background: s.onTimeRate >= 90 ? 'var(--green)' : s.onTimeRate >= 80 ? '#eab308' : 'var(--red)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.onTimeRate >= 90 ? 'var(--green)' : s.onTimeRate >= 80 ? '#eab308' : 'var(--red)' }}>{s.onTimeRate}%</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12, color: s.defectRate > 2 ? 'var(--red)' : 'var(--text)' }}>{s.defectRate}%</span></td>
                    <td style={{ fontWeight: 600 }}>${s.spend.toLocaleString()}</td>
                    <td><span className="badge badge-gray">{s.payment}</span></td>
                    <td><span className={`badge badge-${statusColors[s.status]}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => setModal(s)}><Edit2 size={12} /></button>
                        <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => del(s.id)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(s => (
            <div key={s.id} className="card" style={{ transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--text3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `hsl(${s.id.charCodeAt(3) * 20}, 60%, 20%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    {s.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.category}</div>
                  </div>
                </div>
                <ScoreBadge score={s.score} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className={`badge badge-${statusColors[s.status]}`}>{s.status}</span>
                {s.certified && <span className="badge badge-green"><Award size={9} /> Certified</span>}
                <span className="badge badge-gray">{s.payment}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={11} />{s.country}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={11} />{s.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={11} />{s.phone}</div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div><div style={{ color: 'var(--text3)' }}>On-time</div><div style={{ fontWeight: 700, color: s.onTimeRate >= 90 ? 'var(--green)' : '#eab308' }}>{s.onTimeRate}%</div></div>
                <div><div style={{ color: 'var(--text3)' }}>Defect</div><div style={{ fontWeight: 700, color: s.defectRate > 2 ? 'var(--red)' : 'var(--green)' }}>{s.defectRate}%</div></div>
                <div><div style={{ color: 'var(--text3)' }}>Orders</div><div style={{ fontWeight: 700 }}>{s.totalOrders}</div></div>
                <div><div style={{ color: 'var(--text3)' }}>Spend</div><div style={{ fontWeight: 700 }}>${(s.spend/1000).toFixed(0)}K</div></div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setModal(s)}><Edit2 size={11} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
