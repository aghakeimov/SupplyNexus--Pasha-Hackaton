import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Plus, Search, Edit2, Eye, X, ShoppingBag, DollarSign, Users, TrendingUp, FileText, Trash2, Star, CheckCircle, Clock, AlertTriangle, Ban, Printer, Download, Upload, Mail } from 'lucide-react';
import DataImportModal from '../components/DataImportModal';
import { exportSalesOrderPDF } from '../services/pdfExport';
import { sendSOEmail } from '../services/emailService';

const statusCfg = {
  draft:      { label: 'Draft',      color: 'gray' },
  approved:   { label: 'Approved',   color: 'blue' },
  processing: { label: 'Processing', color: 'yellow' },
  delivered:  { label: 'Delivered',  color: 'green' },
  cancelled:  { label: 'Cancelled',  color: 'red' },
};
const payCfg = {
  paid:     { label: 'Paid',     color: 'green' },
  pending:  { label: 'Pending',  color: 'yellow' },
  unpaid:   { label: 'Unpaid',   color: 'red' },
  refunded: { label: 'Refunded', color: 'gray' },
};

/* ── Sale Order Modal ─────────────────────────────────────── */
function SaleModal({ sale, customers, onSave, onClose }) {
  const [form, setForm] = useState(sale || {
    id: `SO-2024-${String(Date.now()).slice(-4)}`, customerId: '', customer: '',
    items: [{ name: '', qty: 1, unitPrice: 0, total: 0 }],
    subtotal: 0, discount: 0, tax: 0, total: 0,
    status: 'draft', priority: 'medium', date: new Date().toISOString().split('T')[0],
    deliveryDate: '', paymentStatus: 'unpaid', paymentMethod: 'bank_transfer',
    notes: '', rep: 'Murad A.',
  });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setCustomer = (id) => {
    const c = customers.find(x => x.id === id);
    setForm(f => ({ ...f, customerId: id, customer: c?.name || '' }));
  };

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    if (field === 'qty' || field === 'unitPrice') items[idx].total = items[idx].qty * items[idx].unitPrice;
    const subtotal = items.reduce((a, i) => a + i.total, 0);
    const tax = (subtotal - form.discount) * 0.1;
    setForm(f => ({ ...f, items, subtotal, tax, total: subtotal - f.discount + tax }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', qty: 1, unitPrice: 0, total: 0 }] }));
  const removeItem = (idx) => {
    const items = form.items.filter((_, i) => i !== idx);
    const subtotal = items.reduce((a, i) => a + i.total, 0);
    const tax = (subtotal - form.discount) * 0.1;
    setForm(f => ({ ...f, items, subtotal, tax, total: subtotal - f.discount + tax }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">{sale ? 'Edit Sales Order' : 'New Sales Order'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Order ID</label>
              <input className="form-control" value={form.id} onChange={e => s('id', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Customer</label>
              <select className="form-control" value={form.customerId} onChange={e => setCustomer(e.target.value)}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Order Date</label>
              <input className="form-control" type="date" value={form.date} onChange={e => s('date', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Delivery Date</label>
              <input className="form-control" type="date" value={form.deliveryDate} onChange={e => s('deliveryDate', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => s('status', e.target.value)}>
                {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => s('priority', e.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></div>
            <div className="form-group"><label className="form-label">Payment Method</label>
              <select className="form-control" value={form.paymentMethod} onChange={e => s('paymentMethod', e.target.value)}>
                <option value="bank_transfer">Bank Transfer</option><option value="credit">Credit</option>
                <option value="cash">Cash</option><option value="card">Card</option>
              </select></div>
            <div className="form-group"><label className="form-label">Payment Status</label>
              <select className="form-control" value={form.paymentStatus} onChange={e => s('paymentStatus', e.target.value)}>
                {Object.entries(payCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
          </div>

          {/* Line items */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Line Items</label>
              <button className="btn btn-ghost btn-sm" onClick={addItem}><Plus size={12}/> Add Item</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 32px', gap: 8, marginBottom: 6 }}>
                <input className="form-control" placeholder="Item name" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)}/>
                <input className="form-control" type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', +e.target.value)}/>
                <input className="form-control" type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', +e.target.value)}/>
                <div className="form-control" style={{ background: 'var(--bg4)', textAlign: 'right' }}>${item.total.toLocaleString()}</div>
                {form.items.length > 1 && <button className="btn-icon" onClick={() => removeItem(i)} style={{ padding: 4 }}><Trash2 size={12}/></button>}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Subtotal: <strong>${form.subtotal.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--text3)' }}>Discount:</span>
              <input className="form-control" type="number" style={{ width: 80, padding: '4px 8px', fontSize: 12 }} value={form.discount}
                onChange={e => { const d = +e.target.value; const tax = (form.subtotal - d) * 0.1; s('discount', d); s('tax', tax); s('total', form.subtotal - d + tax); }}/>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Tax (10%): <strong>${form.tax.toFixed(2)}</strong></div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>Total: ${form.total.toFixed(2)}</div>
          </div>

          <div className="form-group"><label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} value={form.notes} onChange={e => s('notes', e.target.value)}/></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{sale ? 'Save Changes' : 'Create Order'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Sale Detail / Invoice ────────────────────────────────── */
function SaleDetail({ sale, onClose, onApprove }) {
  const sc = statusCfg[sale.status] || statusCfg.draft;
  const pc = payCfg[sale.paymentStatus] || payCfg.unpaid;
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{sale.id}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sale.customer}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className={`badge badge-${sc.color}`}>{sc.label}</span>
            <button className="btn-icon" onClick={onClose}><X size={14}/></button>
          </div>
        </div>
        <div className="modal-body">
          {/* Invoice-style header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)' }}>
            <div><strong>Date:</strong> {sale.date}</div>
            <div><strong>Delivery:</strong> {sale.deliveryDate}</div>
            <div><strong>Rep:</strong> {sale.rep}</div>
          </div>

          {/* Items table */}
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead><tr><th>Item</th><th style={{ textAlign:'right' }}>Qty</th><th style={{ textAlign:'right' }}>Price</th><th style={{ textAlign:'right' }}>Total</th></tr></thead>
              <tbody>
                {sale.items.map((item, i) => (
                  <tr key={i}><td>{item.name}</td><td style={{ textAlign:'right' }}>{item.qty}</td>
                    <td style={{ textAlign:'right' }}>${item.unitPrice}</td><td style={{ textAlign:'right', fontWeight:600 }}>${item.total.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end', padding:'12px 0', borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:12, color:'var(--text3)' }}>Subtotal: ${sale.subtotal.toLocaleString()}</div>
            {sale.discount > 0 && <div style={{ fontSize:12, color:'var(--red)' }}>Discount: -${sale.discount}</div>}
            <div style={{ fontSize:12, color:'var(--text3)' }}>Tax: ${sale.tax}</div>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--green)' }}>${sale.total.toLocaleString()}</div>
          </div>

          {/* Payment info */}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid var(--border)', fontSize:13 }}>
            <span style={{ color:'var(--text3)' }}>Payment</span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ textTransform:'capitalize' }}>{sale.paymentMethod?.replace('_',' ')}</span>
              <span className={`badge badge-${pc.color}`}>{pc.label}</span>
            </div>
          </div>
          {sale.notes && <div style={{ fontSize:12, color:'var(--text3)', padding:'6px 0' }}>📝 {sale.notes}</div>}
        </div>
        <div className="modal-footer">
          {sale.status === 'draft' && <button className="btn btn-success" onClick={() => onApprove(sale)}>Approve Order</button>}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Customer Modal ───────────────────────────────────────── */
function CustomerModal({ customer, onSave, onClose }) {
  const [form, setForm] = useState(customer || {
    id: `CUS${String(Date.now()).slice(-3)}`, name: '', type: 'corporate', contact: '', email: '', phone: '',
    address: '', segment: 'retail', creditLimit: 0, balance: 0, status: 'active',
    since: new Date().toISOString().split('T')[0], rating: 3,
  });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">{customer ? 'Edit Customer' : 'New Customer'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => s('name', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e => s('type', e.target.value)}>
                <option value="corporate">Corporate</option><option value="sme">SME</option><option value="individual">Individual</option>
              </select></div>
            <div className="form-group"><label className="form-label">Contact</label><input className="form-control" value={form.contact} onChange={e => s('contact', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => s('email', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => s('phone', e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Segment</label>
              <select className="form-control" value={form.segment} onChange={e => s('segment', e.target.value)}>
                {['retail','wholesale','enterprise','media'].map(v => <option key={v} value={v}>{v}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Credit Limit ($)</label><input className="form-control" type="number" value={form.creditLimit} onChange={e => s('creditLimit', +e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Rating (1-5)</label><input className="form-control" type="number" min={1} max={5} value={form.rating} onChange={e => s('rating', +e.target.value)}/></div>
          </div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => s('address', e.target.value)}/></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{customer ? 'Save' : 'Create Customer'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Sales Page ──────────────────────────────────────── */
export default function Sales() {
  const { state, dispatch, notify } = useStore();
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saleModal, setSaleModal] = useState(null);
  const [custModal, setCustModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const orders = state.salesOrders || [];
  const custs = state.customers || [];

  // Filters
  const filteredOrders = orders.filter(o => {
    const ms = search.toLowerCase();
    const match = o.id.toLowerCase().includes(ms) || o.customer.toLowerCase().includes(ms);
    return match && (filterStatus === 'all' || o.status === filterStatus);
  });
  const filteredCusts = custs.filter(c => {
    const ms = search.toLowerCase();
    return c.name.toLowerCase().includes(ms) || c.contact.toLowerCase().includes(ms) || c.email.toLowerCase().includes(ms);
  });

  // KPIs
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0);
  const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((a, o) => a + o.total, 0);
  const pendingOrders = orders.filter(o => ['draft','approved','processing'].includes(o.status)).length;
  const activeCustomers = custs.filter(c => c.status === 'active').length;

  const saveSale = (form) => {
    if (saleModal === 'new') { dispatch({ type: 'ADD_SALE', payload: form }); notify('Sales order created', 'success'); }
    else { dispatch({ type: 'UPDATE_SALE', payload: form }); notify('Sales order updated', 'success'); }
    setSaleModal(null);
  };
  const saveCust = (form) => {
    if (custModal === 'new') { dispatch({ type: 'ADD_CUSTOMER', payload: form }); notify('Customer created', 'success'); }
    else { dispatch({ type: 'UPDATE_CUSTOMER', payload: form }); notify('Customer updated', 'success'); }
    setCustModal(null);
  };
  const approveSale = (sale) => {
    dispatch({ type: 'UPDATE_SALE', payload: { ...sale, status: 'approved' } });
    notify(`${sale.id} approved`, 'success');
    setDetail(null);
  };
  const deleteSale = (id) => { dispatch({ type: 'DELETE_SALE', payload: id }); notify('Order deleted', 'info'); };

  return (
    <div>
      {saleModal && <SaleModal sale={saleModal === 'new' ? null : saleModal} customers={custs} onSave={saveSale} onClose={() => setSaleModal(null)}/>}
      {custModal && <CustomerModal customer={custModal === 'new' ? null : custModal} onSave={saveCust} onClose={() => setCustModal(null)}/>}
      {detail && <SaleDetail sale={detail} onClose={() => setDetail(null)} onApprove={approveSale}/>}
      {showImport && <DataImportModal moduleType="salesOrders" onImport={(data) => { data.forEach(d => dispatch({ type: 'ADD_SALE', payload: d })); notify(`${data.length} sales orders imported`, 'success'); setShowImport(false); }} onClose={() => setShowImport(false)} />}

      {/* Header */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div className="page-title">Sales Management</div>
          <div className="page-sub">Manage sales orders, invoices, customers — fully paperless</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={() => setShowImport(true)}><Upload size={14}/> Import</button>
          <button className="btn btn-ghost" onClick={() => setCustModal('new')}><Users size={14}/> New Customer</button>
          <button className="btn btn-primary" onClick={() => setSaleModal('new')}><Plus size={14}/> New Sales Order</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label: 'Total Revenue', value: `$${(totalRevenue/1000).toFixed(1)}K`, color: 'green' },
          { label: 'Collected', value: `$${(paidRevenue/1000).toFixed(1)}K`, color: 'blue' },
          { label: 'Pending Orders', value: pendingOrders, color: 'yellow' },
          { label: 'Active Customers', value: activeCustomers, color: 'red' },
        ].map((k, i) => (
          <div key={i} className={`stat-card ${k.color}`}>
            <span className="stat-label">{k.label}</span>
            <div className="stat-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs: Orders / Customers */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div className="tabs">
            <button className={`tab ${tab==='orders'?'active':''}`} onClick={() => setTab('orders')}>Sales Orders</button>
            <button className={`tab ${tab==='customers'?'active':''}`} onClick={() => setTab('customers')}>Customers</button>
          </div>
          <div className="search-bar" style={{ flex:1, minWidth:200 }}>
            <Search size={14} color="var(--text3)"/>
            <input placeholder={tab==='orders' ? 'Search orders...' : 'Search customers...'} value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          {tab === 'orders' && (
            <div className="tabs">
              {['all','draft','approved','processing','delivered','cancelled'].map(s => (
                <button key={s} className={`tab ${filterStatus===s?'active':''}`} onClick={() => setFilterStatus(s)}>
                  {s === 'all' ? 'All' : statusCfg[s]?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th>
                <th style={{ textAlign:'right' }}>Total</th><th>Status</th><th>Payment</th><th>Rep</th><th></th>
              </tr></thead>
              <tbody>
                {filteredOrders.map(o => {
                  const sc = statusCfg[o.status]; const pc = payCfg[o.paymentStatus];
                  return (
                    <tr key={o.id}>
                      <td><span style={{ fontFamily:'JetBrains Mono', fontWeight:600, fontSize:12 }}>{o.id}</span>
                        {o.priority==='high' && <span style={{ marginLeft:6, color:'var(--red)', fontSize:10 }}>● HIGH</span>}
                      </td>
                      <td style={{ fontWeight:500 }}>{o.customer}</td>
                      <td style={{ fontSize:12, color:'var(--text2)' }}>{o.date}</td>
                      <td style={{ fontSize:12 }}>{o.items.length} item{o.items.length>1?'s':''}</td>
                      <td style={{ textAlign:'right', fontWeight:700 }}>${o.total.toLocaleString()}</td>
                      <td><span className={`badge badge-${sc?.color||'gray'}`}>{sc?.label}</span></td>
                      <td><span className={`badge badge-${pc?.color||'gray'}`}>{pc?.label}</span></td>
                      <td style={{ fontSize:12, color:'var(--text3)' }}>{o.rep}</td>
                      <td>
                        <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                          <button className="btn-icon" onClick={() => setDetail(o)} title="View"><Eye size={12}/></button>
                          <button className="btn-icon" onClick={() => exportSalesOrderPDF(o)} title="PDF"><Download size={12}/></button>
                          <button className="btn-icon" onClick={() => { const c = custs.find(x => x.id === o.customerId); sendSOEmail(o, c); }} title="Email" style={{ color:'#3b82f6' }}><Mail size={12}/></button>
                          <button className="btn-icon" onClick={() => setSaleModal(o)} title="Edit"><Edit2 size={12}/></button>
                          <button className="btn-icon" onClick={() => deleteSale(o.id)} title="Delete" style={{ color:'var(--red)' }}><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredOrders.length===0 && <div className="empty-state"><ShoppingBag size={40}/><div>No sales orders found</div></div>}
          </div>
        </div>
      )}

      {/* Customers tab */}
      {tab === 'customers' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Customer</th><th>Type</th><th>Contact</th><th>Segment</th>
                <th style={{ textAlign:'right' }}>Credit Limit</th><th style={{ textAlign:'right' }}>Balance</th>
                <th>Rating</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {filteredCusts.map(c => (
                  <tr key={c.id}>
                    <td><div style={{ fontWeight:600 }}>{c.name}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{c.address}</div></td>
                    <td><span className="badge badge-blue" style={{ textTransform:'capitalize' }}>{c.type}</span></td>
                    <td><div style={{ fontSize:12 }}>{c.contact}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{c.email}</div></td>
                    <td style={{ textTransform:'capitalize', fontSize:12 }}>{c.segment}</td>
                    <td style={{ textAlign:'right', fontWeight:600 }}>${c.creditLimit.toLocaleString()}</td>
                    <td style={{ textAlign:'right', color: c.balance > c.creditLimit*0.8 ? 'var(--red)' : 'var(--text)' }}>${c.balance.toLocaleString()}</td>
                    <td>{Array.from({length:5}).map((_,i) => <Star key={i} size={12} fill={i<c.rating?'#eab308':'none'} color={i<c.rating?'#eab308':'var(--text3)'} style={{ marginRight:1 }}/>)}</td>
                    <td><span className={`badge badge-${c.status==='active'?'green':'gray'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn-icon" onClick={() => setCustModal(c)}><Edit2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCusts.length===0 && <div className="empty-state"><Users size={40}/><div>No customers found</div></div>}
          </div>
        </div>
      )}
    </div>
  );
}
