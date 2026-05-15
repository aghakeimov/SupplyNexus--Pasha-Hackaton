import React, { useState, useMemo } from 'react';
import { useStore } from '../store/StoreContext';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, ArrowUp, ArrowDown, ArrowLeftRight, X, Zap, Brain, BarChart3, Shield, ShoppingCart, Upload } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';
import ABCXYZPanel from '../components/ABCXYZPanel';
import MarketDemandPanel from '../components/MarketDemandPanel';
import { SafetyStockTab, StockOutRiskTab, ReorderTab } from '../components/StockRiskPanel';
import AIInsightsPanel from '../components/AIInsightsPanel';
import DataImportModal from '../components/DataImportModal';
import { salesHistory, supplierLeadTimes, marketRegions } from '../data/seedData';
import {
  computeABCAnalysis, computeXYZAnalysis, buildABCXYZMatrix,
  analyzeMarketDemand, computeSafetyStock, predictStockOutRisk,
  generateReorderRecommendations, generateAIInsights
} from '../services/warehouseAnalytics';

const statusStyle = { in_stock: 'green', low_stock: 'yellow', out_of_stock: 'red' };
const statusLabel = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };

function InventoryModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || { id: `INV${Date.now()}`, sku: '', name: '', category: '', warehouse: 'WH001', qty: 0, minStock: 0, maxStock: 100, unitCost: 0, unit: 'pcs', location: '', lastMovement: new Date().toISOString().split('T')[0], supplier: '', status: 'in_stock', expiryDate: null });
  const set = (k, v) => setForm(f => {
    const updated = { ...f, [k]: v };
    if (k === 'qty' || k === 'minStock') {
      updated.status = updated.qty === 0 ? 'out_of_stock' : updated.qty <= updated.minStock ? 'low_stock' : 'in_stock';
    }
    return updated;
  });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">SKU</label><input className="form-control" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-XX-001" /></div>
            <div className="form-group"><label className="form-label">Item Name</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select...</option>
                {['Electronics','Packaging','Food & Beverage','Medical','IT Equipment','Raw Materials','Consumer Goods'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Warehouse</label>
              <select className="form-control" value={form.warehouse} onChange={e => set('warehouse', e.target.value)}>
                <option value="WH001">WH001 — Baku Central</option>
                <option value="WH002">WH002 — Ganja Hub</option>
                <option value="WH003">WH003 — Sumgait Depot</option>
                <option value="WH004">WH004 — Nakhchivan Cold</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Quantity</label><input className="form-control" type="number" value={form.qty} onChange={e => set('qty', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Unit</label><input className="form-control" value={form.unit} onChange={e => set('unit', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Min Stock</label><input className="form-control" type="number" value={form.minStock} onChange={e => set('minStock', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Max Stock</label><input className="form-control" type="number" value={form.maxStock} onChange={e => set('maxStock', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Unit Cost ($)</label><input className="form-control" type="number" value={form.unitCost} onChange={e => set('unitCost', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder="A-01-02" /></div>
          </div>
          <div className="form-group"><label className="form-label">Expiry Date (optional)</label><input className="form-control" type="date" value={form.expiryDate || ''} onChange={e => set('expiryDate', e.target.value || null)} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{item ? 'Save Changes' : 'Add Item'}</button>
        </div>
      </div>
    </div>
  );
}

function MovementModal({ item, onSave, onClose }) {
  const [type, setType] = useState('in');
  const [qty, setQty] = useState(1);
  const [ref, setRef] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">Stock Movement — {item?.name}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Movement Type</label>
            <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
              <option value="in">Stock In (Receipt)</option>
              <option value="out">Stock Out (Issue)</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Quantity</label>
            <input className="form-control" type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} />
          </div>
          <div className="form-group"><label className="form-label">Reference (PO / REQ)</label>
            <input className="form-control" value={ref} onChange={e => setRef(e.target.value)} placeholder="PO-2024-XXXX" />
          </div>
          <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ color: 'var(--text2)', marginBottom: 4 }}>Current stock: <strong style={{ color: 'var(--text)' }}>{item?.qty} {item?.unit}</strong></div>
            <div style={{ color: type === 'in' ? 'var(--green)' : 'var(--red)' }}>
              After movement: <strong>{type === 'in' ? item?.qty + qty : Math.max(0, item?.qty - qty)} {item?.unit}</strong>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ type, qty, ref })}>Confirm Movement</button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'movements', label: 'Movements', icon: ArrowLeftRight },
  { id: 'abcxyz', label: 'ABC-XYZ Analysis', icon: BarChart3 },
  { id: 'market', label: 'Market Demand', icon: Search },
  { id: 'safety', label: 'Safety Stock', icon: Shield },
  { id: 'risk', label: 'Stock-Out Risk', icon: AlertTriangle },
  { id: 'reorder', label: 'Reorder AI', icon: Brain },
];

export default function Warehouse() {
  const { state, dispatch, notify } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [modal, setModal] = useState(null);
  const [movModal, setMovModal] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [tab, setTab] = useState('inventory');
  const [showImport, setShowImport] = useState(false);

  // Compute all analytics (memoized)
  const analytics = useMemo(() => {
    const abc = computeABCAnalysis(state.inventory, salesHistory);
    const xyz = computeXYZAnalysis(state.inventory, salesHistory);
    const matrix = buildABCXYZMatrix(abc, xyz);
    const marketDemand = analyzeMarketDemand(salesHistory, marketRegions);
    const safety = computeSafetyStock(state.inventory, salesHistory, supplierLeadTimes);
    const risk = predictStockOutRisk(safety, salesHistory);
    const reorder = generateReorderRecommendations(risk, matrix, supplierLeadTimes);
    const insights = generateAIInsights(abc, xyz, matrix, safety, risk, reorder);
    return { abc, xyz, matrix, marketDemand, safety, risk, reorder, insights };
  }, [state.inventory]);

  const filtered = state.inventory.filter(i => {
    const ms = search.toLowerCase();
    const matchSearch = i.name.toLowerCase().includes(ms) || i.sku.toLowerCase().includes(ms) || i.category.toLowerCase().includes(ms);
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchWH = filterWarehouse === 'all' || i.warehouse === filterWarehouse;
    return matchSearch && matchStatus && matchWH;
  });

  const saveItem = (form) => {
    if (modal === 'new') { dispatch({ type: 'ADD_INVENTORY', payload: form }); notify('Item added to inventory', 'success'); }
    else { dispatch({ type: 'UPDATE_INVENTORY', payload: form }); notify('Inventory item updated', 'success'); }
    setModal(null);
  };

  const deleteItem = (id) => { dispatch({ type: 'DELETE_INVENTORY', payload: id }); notify('Item removed', 'error'); };

  const applyMovement = ({ type, qty, ref }) => {
    const item = movModal;
    const newQty = type === 'in' ? item.qty + qty : Math.max(0, item.qty - qty);
    const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= item.minStock ? 'low_stock' : 'in_stock';
    dispatch({ type: 'UPDATE_INVENTORY', payload: { ...item, qty: newQty, status: newStatus, lastMovement: new Date().toISOString().split('T')[0] } });
    dispatch({ type: 'ADD_MOVEMENT', payload: { id: `MOV${Date.now()}`, type, sku: item.sku, item: item.name, qty, warehouse: item.warehouse, date: new Date().toISOString().split('T')[0], ref, user: 'Elchin Admin' } });
    notify(`Movement recorded: ${type === 'in' ? '+' : '-'}${qty} ${item.unit} of ${item.name}`, 'success');
    setMovModal(null);
  };

  const createPOFromRecommendation = (rec) => {
    const po = {
      id: `PO-2024-${String(Date.now()).slice(-4)}`,
      supplier: rec.supplierName, supplierId: rec.supplier,
      items: [{ name: rec.name, qty: rec.suggestedQty, unit: rec.unit, unitPrice: rec.unitCost, total: rec.estimatedCost }],
      total: rec.estimatedCost, status: 'draft', priority: rec.urgency === 'IMMEDIATE' ? 'high' : 'medium',
      created: new Date().toISOString().split('T')[0], delivery: rec.orderByDate,
      category: rec.category, department: 'Warehouse', approver: '', notes: `Auto-generated from ${rec.cell} reorder recommendation`, matched: false,
    };
    dispatch({ type: 'ADD_PO', payload: po });
  };

  const totalValue = state.inventory.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const whStats = state.warehouses.map(w => ({ ...w, utilization: Math.round(w.occupied / w.capacity * 100) }));
  const azCount = analytics.matrix['AZ']?.count || 0;
  const belowSafety = analytics.safety.filter(i => i.qty > 0 && i.qty < i.safetyStock).length;

  return (
    <div>
      {modal && <InventoryModal item={modal === 'new' ? null : modal} onSave={saveItem} onClose={() => setModal(null)} />}
      {movModal && <MovementModal item={movModal} onSave={applyMovement} onClose={() => setMovModal(null)} />}
      {showImport && <DataImportModal moduleType="inventory" onImport={(data) => { data.forEach(d => dispatch({ type: 'ADD_INVENTORY', payload: d })); notify(`${data.length} items imported`, 'success'); setShowImport(false); }} onClose={() => setShowImport(false)} />}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Warehouse Management</div>
          <div className="page-sub">Inventory control, stock movements, ABC-XYZ analytics & AI recommendations</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowImport(true)}><Upload size={14} /> Import</button>
          <button className="btn btn-ghost" onClick={() => setShowAI(!showAI)}><Zap size={14} /> Intelligence</button>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> Add Item</button>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {whStats.map(w => (
          <div key={w.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{w.name.split(' ').slice(0, 2).join(' ')}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{w.location}</div>
              </div>
              <span className={`badge badge-${w.active ? 'green' : 'gray'}`}>{w.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                <span>Utilization</span><span style={{ fontWeight: 600, color: w.utilization > 80 ? 'var(--red)' : 'var(--green)' }}>{w.utilization}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${w.utilization}%`, background: w.utilization > 80 ? 'var(--red)' : 'var(--green)' }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{w.occupied.toLocaleString()} / {w.capacity.toLocaleString()} units</div>
          </div>
        ))}
      </div>

      {/* KPIs — 6 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total SKUs', value: state.inventory.length, color: 'blue' },
          { label: 'Inventory Value', value: `$${(totalValue/1000).toFixed(0)}K`, color: 'green' },
          { label: 'Low Stock Items', value: state.inventory.filter(i => i.qty > 0 && i.qty <= i.minStock).length, color: 'yellow' },
          { label: 'Out of Stock', value: state.inventory.filter(i => i.qty === 0).length, color: 'red' },
          { label: 'AZ High-Risk', value: azCount, color: 'orange' },
          { label: 'Below Safety', value: belowSafety, color: 'red' },
        ].map((k, i) => (
          <div key={i} className={`stat-card ${k.color}`}>
            <span className="stat-label">{k.label}</span>
            <div className="stat-value">{k.value}</div>
          </div>
        ))}
      </div>

      {showAI && <div className="card" style={{ marginBottom: 20 }}><AIAssistant context={{ inventory: state.inventory }} /></div>}

      {/* AI Insights Banner (always visible for analytics tabs) */}
      {['abcxyz','safety','risk','reorder'].includes(tab) && analytics.insights.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <AIInsightsPanel insights={analytics.insights} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: 16, overflowX: 'auto' }}>
        <div className="tabs" style={{ display: 'inline-flex' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon size={13} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'inventory' && (
        <>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
                <Search size={14} color="var(--text3)" />
                <input placeholder="Search items, SKU, category..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-control" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select className="form-control" style={{ width: 180 }} value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}>
                <option value="all">All Warehouses</option>
                {state.warehouses.map(w => <option key={w.id} value={w.id}>{w.id} — {w.name.split(' ').slice(0,2).join(' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>SKU</th><th>Item Name</th><th>Category</th><th>Warehouse</th><th>Qty</th><th>Min/Max</th><th>Unit Cost</th><th>Total Value</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{item.sku}</span></td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td><span className="tag">{item.category}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{item.warehouse}</td>
                      <td style={{ fontWeight: 700, color: item.qty === 0 ? 'var(--red)' : item.qty <= item.minStock ? '#eab308' : 'var(--text)' }}>{item.qty} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text3)' }}>{item.unit}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{item.minStock} / {item.maxStock}</td>
                      <td>${item.unitCost.toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>${(item.qty * item.unitCost).toLocaleString()}</td>
                      <td><span className={`badge badge-${statusStyle[item.status]}`}>{statusLabel[item.status]}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" title="Stock Movement" onClick={() => setMovModal(item)}><ArrowLeftRight size={12} /></button>
                          <button className="btn-icon" title="Edit" onClick={() => setModal(item)}><Edit2 size={12} /></button>
                          <button className="btn-icon" title="Delete" style={{ color: 'var(--red)' }} onClick={() => deleteItem(item.id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'movements' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Item</th><th>SKU</th><th>Qty</th><th>Warehouse</th><th>Reference</th><th>User</th></tr></thead>
              <tbody>
                {state.stockMovements.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{m.date}</td>
                    <td>
                      <span className={`badge badge-${m.type === 'in' ? 'green' : m.type === 'out' ? 'red' : 'blue'}`}>
                        {m.type === 'in' ? <ArrowDown size={10} /> : m.type === 'out' ? <ArrowUp size={10} /> : <ArrowLeftRight size={10} />}
                        {m.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{m.item}</td>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{m.sku}</span></td>
                    <td style={{ fontWeight: 600, color: m.type === 'in' ? 'var(--green)' : m.type === 'out' ? 'var(--red)' : '#3b82f6' }}>{m.type === 'in' ? '+' : m.type === 'out' ? '-' : '↔'}{m.qty}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{m.warehouse}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{m.ref}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'abcxyz' && <ABCXYZPanel abcResults={analytics.abc} xyzResults={analytics.xyz} matrix={analytics.matrix} />}
      {tab === 'market' && <MarketDemandPanel marketDemandData={analytics.marketDemand} marketRegions={marketRegions} />}
      {tab === 'safety' && <SafetyStockTab safetyStockResults={analytics.safety} />}
      {tab === 'risk' && <StockOutRiskTab stockOutRisk={analytics.risk} />}
      {tab === 'reorder' && <ReorderTab recommendations={analytics.reorder} onCreatePO={createPOFromRecommendation} notify={notify} />}
    </div>
  );
}
