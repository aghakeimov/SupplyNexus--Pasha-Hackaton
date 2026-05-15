import React, { useState, Suspense } from 'react';
import { useStore } from '../store/StoreContext';
import {
  Plus, Search, Edit2, MapPin, Truck, Package, Clock,
  AlertTriangle, X, Zap, CheckCircle, Navigation, Map,
} from 'lucide-react';
import AIAssistant from '../components/AIAssistant';

// Lazy load the map panel (leaflet is heavy)
const RouteMapPanel = React.lazy(() => import('../components/RouteMapPanel'));

const statusConfig = {
  processing: { label: 'Processing', color: 'gray', dot: 'dot-gray' },
  in_transit:  { label: 'In Transit', color: 'blue', dot: 'dot-blue' },
  customs:     { label: 'Customs',    color: 'yellow', dot: 'dot-yellow' },
  delivered:   { label: 'Delivered',  color: 'green', dot: 'dot-green' },
  delayed:     { label: 'Delayed',    color: 'red', dot: 'dot-red' },
};

const modeIcons = { Air: '✈', Sea: '🚢', Road: '🚛', Rail: '🚂' };

/* ─── Shipment Modal ─────────────────────────────────────────────────────── */
function ShipmentModal({ shipment, onSave, onClose }) {
  const [form, setForm] = useState(
    shipment || {
      id: `SHP-2024-${String(Date.now()).slice(-4)}`,
      poId: '', origin: '', destination: '', carrier: '',
      mode: 'Road', status: 'processing', dispatched: null,
      eta: '', tracking: '', weight: '', cost: 0, items: 1, risk: 'low',
    }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{shipment ? 'Edit Shipment' : 'New Shipment'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Shipment ID</label><input className="form-control" value={form.id} onChange={e => set('id', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">PO Reference</label><input className="form-control" value={form.poId} onChange={e => set('poId', e.target.value)} placeholder="PO-2024-XXXX" /></div>
            <div className="form-group"><label className="form-label">Origin</label><input className="form-control" value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="City, Country" /></div>
            <div className="form-group"><label className="form-label">Destination</label><input className="form-control" value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="City, Country" /></div>
            <div className="form-group"><label className="form-label">Carrier</label><input className="form-control" value={form.carrier} onChange={e => set('carrier', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Mode</label>
              <select className="form-control" value={form.mode} onChange={e => set('mode', e.target.value)}>
                {['Air','Sea','Road','Rail'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Dispatch Date</label><input className="form-control" type="date" value={form.dispatched || ''} onChange={e => set('dispatched', e.target.value || null)} /></div>
            <div className="form-group"><label className="form-label">ETA</label><input className="form-control" type="date" value={form.eta} onChange={e => set('eta', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.keys(statusConfig).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Risk Level</label>
              <select className="form-control" value={form.risk} onChange={e => set('risk', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Freight Cost ($)</label><input className="form-control" type="number" value={form.cost} onChange={e => set('cost', Number(e.target.value))} /></div>
            <div className="form-group"><label className="form-label">Weight</label><input className="form-control" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="500 kg" /></div>
          </div>
          <div className="form-group"><label className="form-label">Tracking Number</label><input className="form-control" value={form.tracking || ''} onChange={e => set('tracking', e.target.value)} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{shipment ? 'Save Changes' : 'Create Shipment'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shipment Detail Modal ──────────────────────────────────────────────── */
function ShipmentDetail({ shipment, onClose }) {
  const steps = ['processing', 'in_transit', 'customs', 'delivered'];
  const current = steps.indexOf(shipment.status);
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{shipment.id}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{shipment.poId} · {modeIcons[shipment.mode]} {shipment.mode}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= current ? 'var(--green)' : 'var(--bg4)', border: `2px solid ${i <= current ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i <= current ? <CheckCircle size={14} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text3)' }} />}
                  </div>
                  <div style={{ fontSize: 9, color: i <= current ? 'var(--green)' : 'var(--text3)', textTransform: 'capitalize', textAlign: 'center' }}>{statusConfig[s]?.label}</div>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < current ? 'var(--green)' : 'var(--border)', marginBottom: 20, transition: 'background 0.3s' }} />}
              </React.Fragment>
            ))}
          </div>
          {[
            ['Origin', shipment.origin], ['Destination', shipment.destination],
            ['Carrier', shipment.carrier], ['Weight', shipment.weight],
            ['Dispatched', shipment.dispatched || 'Not yet'], ['ETA', shipment.eta],
            ['Freight Cost', `$${shipment.cost.toLocaleString()}`], ['Tracking', shipment.tracking || 'N/A'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text3)' }}>{label}</span>
              <span style={{ fontWeight: 500, fontFamily: label === 'Tracking' ? 'JetBrains Mono' : 'inherit', fontSize: label === 'Tracking' ? 12 : 13 }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--text3)' }}>Risk Level</span>
            <span className={`badge badge-${shipment.risk === 'high' ? 'red' : shipment.risk === 'medium' ? 'yellow' : 'green'}`}>{shipment.risk}</span>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

/* ─── Main Logistics Page ────────────────────────────────────────────────── */
export default function Logistics() {
  const { state, dispatch, notify } = useStore();
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal]           = useState(null);
  const [detail, setDetail]         = useState(null);
  const [showAI, setShowAI]         = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);

  const filtered = state.shipments.filter(s => {
    const ms = search.toLowerCase();
    const matchSearch = s.id.toLowerCase().includes(ms) || s.carrier.toLowerCase().includes(ms) || s.origin.toLowerCase().includes(ms) || s.destination.toLowerCase().includes(ms);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const save = (form) => {
    if (modal === 'new') { dispatch({ type: 'ADD_SHIPMENT', payload: form }); notify('Shipment created', 'success'); }
    else { dispatch({ type: 'UPDATE_SHIPMENT', payload: form }); notify('Shipment updated', 'success'); }
    setModal(null);
  };

  const totalCost = state.shipments.reduce((s, sh) => s + sh.cost, 0);

  return (
    <div>
      {modal   && <ShipmentModal shipment={modal === 'new' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
      {detail  && <ShipmentDetail shipment={detail} onClose={() => setDetail(null)} />}

      {/* ── Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Logistics & Shipments</div>
          <div className="page-sub">Track shipments, manage carriers and monitor freight costs</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowAI(!showAI)}
          >
            <Zap size={14} /> Intelligence
          </button>
          <button
            className="btn"
            onClick={() => setShowRouteMap(v => !v)}
            style={{
              background: showRouteMap
                ? 'linear-gradient(135deg,rgba(0,166,81,0.25),rgba(200,16,46,0.15))'
                : 'var(--bg4)',
              border: `1px solid ${showRouteMap ? 'rgba(0,166,81,0.5)' : 'var(--border)'}`,
              color: showRouteMap ? 'var(--green)' : 'var(--text)',
              gap: 6,
            }}
          >
            <Navigation size={14} />
            Optimal Marşrut
          </button>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> New Shipment</button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Shipments',   value: state.shipments.length,                                          color: 'blue' },
          { label: 'In Transit',        value: state.shipments.filter(s => s.status === 'in_transit').length,   color: 'green' },
          { label: 'High Risk',         value: state.shipments.filter(s => s.risk === 'high').length,           color: 'red' },
          { label: 'Total Freight Cost', value: `$${(totalCost/1000).toFixed(1)}K`,                             color: 'yellow' },
        ].map((k, i) => (
          <div key={i} className={`stat-card ${k.color}`}>
            <span className="stat-label">{k.label}</span>
            <div className="stat-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── AI Assistant Panel ── */}
      {showAI && (
        <div className="card" style={{ marginBottom: 20 }}>
          <AIAssistant context={{ shipments: state.shipments }} />
        </div>
      )}

      {/* ── Optimal Route Map Panel ── */}
      {showRouteMap && (
        <div style={{
          marginBottom: 20,
          border: '1px solid rgba(0,166,81,0.3)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          background: 'var(--bg2)',
          boxShadow: '0 8px 32px rgba(0,166,81,0.1)',
        }}>
          <Suspense fallback={
            <div style={{
              height: 400, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              color: 'var(--text3)',
            }}>
              <div className="spinner" style={{
                width: 32, height: 32, border: '3px solid var(--border)',
                borderTopColor: 'var(--green)', borderRadius: '50%',
              }} />
              <span style={{ fontSize: 13 }}>Xəritə yüklənir…</span>
            </div>
          }>
            <RouteMapPanel />
          </Suspense>
        </div>
      )}

      {/* ── Search / Filter bar ── */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--text3)" />
            <input
              placeholder="Search shipments, carriers, locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs">
            {['all', 'processing', 'in_transit', 'customs', 'delivered'].map(s => (
              <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                {s === 'all' ? 'All' : statusConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Shipment List ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {filtered.map(s => (
          <div key={s.id} className="card" style={{ padding: 16, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {modeIcons[s.mode]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 13 }}>{s.id}</span>
                    <span className={`badge badge-${statusConfig[s.status]?.color || 'gray'}`}>
                      <div className={`dot ${statusConfig[s.status]?.dot}`} style={{ width: 6, height: 6 }} />
                      {statusConfig[s.status]?.label}
                    </span>
                    <span className={`badge badge-${s.risk === 'high' ? 'red' : s.risk === 'medium' ? 'yellow' : 'green'}`}>
                      {s.risk} risk
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                    <MapPin size={11} /><span>{s.origin}</span>
                    <span style={{ color: 'var(--border)' }}>→</span>
                    <span>{s.destination}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                    <span><Truck size={10} style={{ marginRight: 4 }} />{s.carrier}</span>
                    {s.dispatched && <span><Clock size={10} style={{ marginRight: 4 }} />Dispatched: {s.dispatched}</span>}
                    <span>ETA: <strong style={{ color: 'var(--text)' }}>{s.eta}</strong></span>
                    <span>Weight: {s.weight}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>${s.cost.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Freight cost</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDetail(s)}>Track</button>
                  <button className="btn-icon" onClick={() => setModal(s)}><Edit2 size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <Package size={40} /><div>No shipments found</div>
          </div>
        )}
      </div>
    </div>
  );
}
