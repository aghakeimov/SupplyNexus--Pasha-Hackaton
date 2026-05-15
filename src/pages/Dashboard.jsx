import React from 'react';
import { useStore } from '../store/StoreContext';
import { kpiData, demandForecast, marketDemand } from '../data/seedData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, Package, Truck, Users, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import AIAssistant from '../components/AIAssistant';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

export default function Dashboard() {
  const { state } = useStore();
  const lowStock = state.inventory.filter(i => i.qty <= i.minStock).length;
  const pendingPOs = state.purchaseOrders.filter(p => p.status === 'pending').length;
  const activeShipments = state.shipments.filter(s => s.status !== 'delivered').length;
  const activeSuppliers = state.suppliers.filter(s => s.status === 'active').length;

  const recentPOs = [...state.purchaseOrders].slice(0, 5);
  const alerts = [
    ...state.inventory.filter(i => i.qty === 0).map(i => ({ type: 'error', msg: `${i.name} is OUT OF STOCK` })),
    ...state.inventory.filter(i => i.qty > 0 && i.qty <= i.minStock).map(i => ({ type: 'warning', msg: `${i.name}: low stock (${i.qty} units)` })),
    ...state.shipments.filter(s => s.risk === 'high').map(s => ({ type: 'warning', msg: `Shipment ${s.id} is high-risk` })),
    ...state.suppliers.filter(s => s.status === 'suspended').map(s => ({ type: 'error', msg: `Supplier ${s.name} is suspended` })),
  ].slice(0, 5);

  const spendByCategory = [
    { name: 'Electronics', value: 285000 },
    { name: 'Freight', value: 412000 },
    { name: 'Packaging', value: 178000 },
    { name: 'Consumer Goods', value: 334000 },
    { name: 'Other', value: 282000 },
  ];
  const COLORS = ['#C8102E', '#00A651', '#3b82f6', '#eab308', '#f97316'];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Supply Chain Dashboard</div>
          <div className="page-sub">Real-time overview of all procurement, logistics and inventory operations</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="dot dot-green pulse" />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Spend YTD', value: `$${(kpiData.totalSpend/1000).toFixed(0)}K`, sub: '+12.4% vs last year', color: 'red', Icon: DollarSign },
          { label: 'Active Suppliers', value: activeSuppliers, sub: `${state.suppliers.filter(s => s.status === 'suspended').length} suspended`, color: 'green', Icon: Users },
          { label: 'Open Shipments', value: activeShipments, sub: `${state.shipments.filter(s => s.risk === 'high').length} high-risk`, color: 'blue', Icon: Truck },
          { label: 'Stock Alerts', value: lowStock, sub: `${state.inventory.filter(i => i.qty === 0).length} out of stock`, color: 'yellow', Icon: AlertTriangle },
        ].map((k, i) => (
          <div key={i} className={`stat-card ${k.color}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">{k.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.Icon size={16} color={k.color === 'red' ? 'var(--red)' : k.color === 'green' ? 'var(--green)' : k.color === 'blue' ? '#3b82f6' : '#eab308'} />
              </div>
            </div>
            <div className="stat-value">{k.value}</div>
            <div className="stat-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Demand Forecast */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Demand Forecast</span>
            <div className="tabs">
              <button className="tab active">Units</button>
              <button className="tab">Value</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={demandForecast} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A651" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00A651" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8102E" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#C8102E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="actual" stroke="#00A651" strokeWidth={2} fill="url(#ga)" name="Actual" dot={{ r: 3, fill: '#00A651' }} />
              <Area type="monotone" dataKey="forecast" stroke="#C8102E" strokeWidth={2} strokeDasharray="5 5" fill="url(#gf)" name="Forecast" dot={{ r: 3, fill: '#C8102E' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spend by Category */}
        <div className="card">
          <div className="card-header"><span className="card-title">Spend by Category</span></div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={spendByCategory} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                {spendByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`$${(v/1000).toFixed(0)}K`, '']} contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {spendByCategory.slice(0, 3).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                  <span style={{ color: 'var(--text2)' }}>{c.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>${(c.value/1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Recent POs */}
        <div className="card" style={{ gridColumn: '1 / 3' }}>
          <div className="card-header">
            <span className="card-title">Recent Purchase Orders</span>
            <span className="badge badge-gray">{pendingPOs} pending</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>PO Number</th><th>Supplier</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>
                {recentPOs.map(po => (
                  <tr key={po.id}>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{po.id}</span></td>
                    <td>{po.supplier}</td>
                    <td style={{ fontWeight: 600 }}>${po.total.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${po.status === 'delivered' ? 'green' : po.status === 'approved' ? 'blue' : po.status === 'pending' ? 'yellow' : 'gray'}`}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{po.delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Alerts</span>
            <span className="badge badge-red">{alerts.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: a.type === 'error' ? 'rgba(200,16,46,0.08)' : 'rgba(234,179,8,0.08)', borderRadius: 6, border: `1px solid ${a.type === 'error' ? 'rgba(200,16,46,0.2)' : 'rgba(234,179,8,0.2)'}` }}>
                <AlertTriangle size={13} color={a.type === 'error' ? 'var(--red)' : '#eab308'} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{a.msg}</span>
              </div>
            ))}
            {alerts.length === 0 && <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No active alerts</div>}
          </div>
        </div>
      </div>

      {/* Market Demand + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Market Demand by Region</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={marketDemand} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="market" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="electronics" fill="#C8102E" name="Electronics" radius={[3,3,0,0]} />
              <Bar dataKey="food" fill="#00A651" name="Food" radius={[3,3,0,0]} />
              <Bar dataKey="medical" fill="#3b82f6" name="Medical" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 20, height: '100%' }}>
            <AIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}
