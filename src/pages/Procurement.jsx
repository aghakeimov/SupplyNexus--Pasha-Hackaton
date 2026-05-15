import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Plus, Search, Edit2, Trash2, Eye, FileCheck, ChevronDown, X, Zap, Upload, Download, Mail } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';
import DataImportModal from '../components/DataImportModal';
import { exportPurchaseOrderPDF } from '../services/pdfExport';
import { sendPOEmail } from '../services/emailService';

const statusColors = { pending: 'yellow', approved: 'blue', delivered: 'green', draft: 'gray', cancelled: 'red' };
const priorityColors = { high: 'red', medium: 'yellow', low: 'green' };

function POModal({ po, suppliers, onSave, onClose }) {
  const [form, setForm] = useState(po || { id: `PO-2024-${String(Date.now()).slice(-4)}`, supplier: '', supplierId: '', total: 0, status: 'draft', priority: 'medium', created: new Date().toISOString().split('T')[0], delivery: '', category: '', department: '', approver: '', notes: '', items: [{ name: '', qty: 1, unit: 'pcs', unitPrice: 0, total: 0 }], matched: false });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    if (k === 'qty' || k === 'unitPrice') items[i].total = items[i].qty * items[i].unitPrice;
    setForm(f => ({ ...f, items, total: items.reduce((s, x) => s + x.total, 0) }));
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', qty: 1, unit: 'pcs', unitPrice: 0, total: 0 }] }));
  const removeItem = (i) => { const items = form.items.filter((_, idx) => idx !== i); setForm(f => ({ ...f, items, total: items.reduce((s, x) => s + x.total, 0) })); };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <span className="modal-title">{po ? 'Edit Purchase Order' : 'New Purchase Order'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">PO Number</label>
              <input className="form-control" value={form.id} onChange={e => set('id', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-control" value={form.supplierId} onChange={e => { const s = suppliers.find(x => x.id === e.target.value); set('supplierId', e.target.value); set('supplier', s?.name || ''); }}>
                <option value="">Select supplier...</option>
                {suppliers.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select...</option>
                {['Electronics','Packaging','Freight','Medical','IT Equipment','Food & Beverage','Raw Materials','Consumer Goods'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Date</label>
              <input className="form-control" type="date" value={form.delivery} onChange={e => set('delivery', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {['draft','pending','approved','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label">Line Items</label>
              <button className="btn btn-ghost btn-sm" onClick={addItem}><Plus size={12} /> Add Item</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <input className="form-control" placeholder="Item name" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                <input className="form-control" type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} />
                <input className="form-control" type="number" placeholder="Unit price" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                <input className="form-control" placeholder="Total" value={`$${item.total.toLocaleString()}`} readOnly style={{ color: 'var(--text2)' }} />
                {form.items.length > 1 && <button className="btn-icon" onClick={() => removeItem(i)}><X size={12} /></button>}
              </div>
            ))}
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginTop: 8 }}>
              Total: ${form.total.toLocaleString()}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." style={{ resize: 'none' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            {po ? 'Save Changes' : 'Create Purchase Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Procurement() {
  const { state, dispatch, notify } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(null); // null | 'new' | po object
  const [showAI, setShowAI] = useState(false);
  const [viewPO, setViewPO] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const filtered = state.purchaseOrders.filter(po => {
    const matchSearch = po.id.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || po.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const savePO = (form) => {
    if (modal === 'new') {
      dispatch({ type: 'ADD_PO', payload: form });
      notify('Purchase order created successfully', 'success');
    } else {
      dispatch({ type: 'UPDATE_PO', payload: form });
      notify('Purchase order updated', 'success');
    }
    setModal(null);
  };

  const deletePO = (id) => {
    dispatch({ type: 'DELETE_PO', payload: id });
    notify('Purchase order deleted', 'error');
  };

  const approvePO = (po) => {
    dispatch({ type: 'UPDATE_PO', payload: { ...po, status: 'approved', approver: 'Elchin Admin' } });
    notify(`${po.id} approved`, 'success');
  };

  const totals = { all: state.purchaseOrders.length, pending: state.purchaseOrders.filter(p => p.status === 'pending').length, approved: state.purchaseOrders.filter(p => p.status === 'approved').length, delivered: state.purchaseOrders.filter(p => p.status === 'delivered').length };

  return (
    <div>
      {(modal === 'new' || (modal && typeof modal === 'object')) && (
        <POModal po={modal === 'new' ? null : modal} suppliers={state.suppliers} onSave={savePO} onClose={() => setModal(null)} />
      )}
      {showImport && <DataImportModal moduleType="purchaseOrders" onImport={(data) => { data.forEach(d => dispatch({ type: 'ADD_PO', payload: d })); notify(`${data.length} POs imported`, 'success'); setShowImport(false); }} onClose={() => setShowImport(false)} />}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Procurement</div>
          <div className="page-sub">Manage purchase orders, approvals and 3-way matching</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowImport(true)}><Upload size={14} /> Import</button>
          <button className="btn btn-ghost" onClick={() => setShowAI(!showAI)}><Zap size={14} /> Intelligence</button>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> New PO</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Orders', value: totals.all, color: 'blue' },
          { label: 'Pending Approval', value: totals.pending, color: 'yellow' },
          { label: 'Approved', value: totals.approved, color: 'green' },
          { label: 'Total Value', value: `$${(state.purchaseOrders.reduce((s,p)=>s+p.total,0)/1000).toFixed(0)}K`, color: 'red' },
        ].map((k, i) => (
          <div key={i} className={`stat-card ${k.color}`}>
            <span className="stat-label">{k.label}</span>
            <div className="stat-value">{k.value}</div>
          </div>
        ))}
      </div>

      {showAI && (
        <div className="card" style={{ marginBottom: 20 }}>
          <AIAssistant context={{ purchaseOrders: state.purchaseOrders }} />
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--text3)" />
            <input placeholder="Search by PO number or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs">
            {['all', 'draft', 'pending', 'approved', 'delivered'].map(s => (
              <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PO Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Status</th>
                <th>3-Way Match</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>No purchase orders found</td></tr>
              )}
              {filtered.map(po => (
                <tr key={po.id}>
                  <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text)' }}>{po.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{po.supplier}</td>
                  <td><span className="tag">{po.category}</span></td>
                  <td style={{ fontWeight: 600 }}>${po.total.toLocaleString()}</td>
                  <td><span className={`badge badge-${priorityColors[po.priority]}`}>{po.priority}</span></td>
                  <td><span className={`badge badge-${statusColors[po.status] || 'gray'}`}>{po.status}</span></td>
                  <td>
                    {po.matched
                      ? <span className="badge badge-green"><FileCheck size={10} /> Matched</span>
                      : <span className="badge badge-gray">Pending</span>}
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{po.delivery || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {po.status === 'pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => approvePO(po)}>Approve</button>
                      )}
                      <button className="btn-icon" onClick={() => exportPurchaseOrderPDF(po)} title="PDF"><Download size={12} /></button>
                      <button className="btn-icon" onClick={() => { const s = state.suppliers.find(x => x.id === po.supplierId); sendPOEmail(po, s); }} title="Email" style={{ color: '#3b82f6' }}><Mail size={12} /></button>
                      <button className="btn-icon" onClick={() => setModal(po)} title="Edit"><Edit2 size={12} /></button>
                      <button className="btn-icon" onClick={() => deletePO(po.id)} title="Delete" style={{ color: 'var(--red)' }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
