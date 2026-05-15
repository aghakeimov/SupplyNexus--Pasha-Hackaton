import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { demandForecast, marketDemand } from '../data/seedData';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend } from 'recharts';
import AIAssistant from '../components/AIAssistant';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

const COLORS = ['#C8102E', '#00A651', '#3b82f6', '#eab308', '#f97316', '#8b5cf6'];

export default function Analytics() {
  const { state } = useStore();
  const [showAI, setShowAI] = useState(false);
  const [tab, setTab] = useState('overview');

  // Spend trend (simulated monthly)
  const spendTrend = [
    { month: 'Jan', procurement: 142000, logistics: 38000, warehouse: 12000 },
    { month: 'Feb', procurement: 118000, logistics: 29000, warehouse: 9000 },
    { month: 'Mar', procurement: 195000, logistics: 44000, warehouse: 14000 },
    { month: 'Apr', procurement: 167000, logistics: 51000, warehouse: 11000 },
    { month: 'May', procurement: 224000, logistics: 62000, warehouse: 15000 },
  ];

  const supplierRadar = state.suppliers.filter(s => s.status === 'active').slice(0, 3).map(s => ({
    name: s.name.split(' ')[0],
    'On-Time': s.onTimeRate,
    'Quality': 100 - s.defectRate * 10,
    'Score': s.score,
    'Orders': Math.min(s.totalOrders, 100),
  }));

  const categorySpend = [
    { name: 'Electronics', value: 285000 },
    { name: 'Freight', value: 412000 },
    { name: 'Packaging', value: 178000 },
    { name: 'Consumer Goods', value: 334000 },
    { name: 'Medical', value: 95000 },
    { name: 'IT Equipment', value: 52000 },
  ];

  const poStatusData = [
    { name: 'Delivered', value: state.purchaseOrders.filter(p => p.status === 'delivered').length },
    { name: 'Approved', value: state.purchaseOrders.filter(p => p.status === 'approved').length },
    { name: 'Pending', value: state.purchaseOrders.filter(p => p.status === 'pending').length },
    { name: 'Draft', value: state.purchaseOrders.filter(p => p.status === 'draft').length },
  ];

  const inventoryHealth = [
    { name: 'In Stock', value: state.inventory.filter(i => i.status === 'in_stock').length, fill: '#00A651' },
    { name: 'Low Stock', value: state.inventory.filter(i => i.status === 'low_stock').length, fill: '#eab308' },
    { name: 'Out of Stock', value: state.inventory.filter(i => i.status === 'out_of_stock').length, fill: '#C8102E' },
  ];

  const kpis = [
    { label: 'On-Time Delivery', value: '91.4%', trend: '+2.1%', up: true },
    { label: 'Inventory Turnover', value: '4.2x', trend: '-0.3x', up: false },
    { label: 'Avg Lead Time', value: '8.2 days', trend: '-1.1d', up: true },
    { label: 'Supplier Satisfaction', value: '84%', trend: '+5%', up: true },
    { label: 'Cost Per Order', value: '$3,240', trend: '-$180', up: true },
    { label: 'Fill Rate', value: '96.8%', trend: '+0.4%', up: true },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Analytics & Intelligence</div>
          <div className="page-sub">Supply chain performance metrics, trends and insights</div>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowAI(!showAI)}><Zap size={14} /> Intelligence</button>
      </div>

      {showAI && <div className="card" style={{ marginBottom: 20 }}><AIAssistant /></div>}

      {/* KPI Row */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{k.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              {k.up ? <TrendingUp size={12} color="var(--green)" /> : <TrendingDown size={12} color="var(--red)" />}
              <span style={{ color: k.up ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{k.trend}</span>
              <span style={{ color: 'var(--text3)' }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 20, display: 'inline-flex' }}>
        {['overview', 'procurement', 'inventory', 'suppliers'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">Spend Trend by Module</span></div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={spendTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8102E" stopOpacity={0.3}/><stop offset="95%" stopColor="#C8102E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A651" stopOpacity={0.3}/><stop offset="95%" stopColor="#00A651" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `$${v/1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="procurement" stroke="#C8102E" fill="url(#gp)" name="Procurement" strokeWidth={2} />
                  <Area type="monotone" dataKey="logistics" stroke="#00A651" fill="url(#gl)" name="Logistics" strokeWidth={2} />
                  <Area type="monotone" dataKey="warehouse" stroke="#3b82f6" fill="none" name="Warehouse" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Demand Forecast</span></div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={demandForecast} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="actual" stroke="#00A651" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#C8102E" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid-3">
            <div className="card">
              <div className="card-header"><span className="card-title">Category Spend</span></div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categorySpend} cx="50%" cy="50%" outerRadius={65} innerRadius={35} dataKey="value" paddingAngle={3}>
                    {categorySpend.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`$${(v/1000).toFixed(0)}K`]} contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categorySpend.slice(0,3).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} /><span style={{ color: 'var(--text2)' }}>{c.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>${(c.value/1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">PO Status</span></div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={poStatusData} cx="50%" cy="50%" outerRadius={65} innerRadius={35} dataKey="value" paddingAngle={3}>
                    {poStatusData.map((_, i) => <Cell key={i} fill={['#00A651','#3b82f6','#eab308','#6b7280'][i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {poStatusData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#00A651','#3b82f6','#eab308','#6b7280'][i] }} /><span style={{ color: 'var(--text2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Inventory Health</span></div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={inventoryHealth} cx="50%" cy="50%" outerRadius={65} innerRadius={35} dataKey="value" paddingAngle={3}>
                    {inventoryHealth.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {inventoryHealth.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} /><span style={{ color: 'var(--text2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'procurement' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Monthly Procurement Spend</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={spendTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `$${v/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="procurement" fill="#C8102E" name="Procurement" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">PO Value by Supplier</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart layout="vertical" data={state.suppliers.slice(0,6).map(s => ({ name: s.name.split(' ')[0], spend: s.spend }))} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `$${v/1000}K`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text2)' }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="spend" fill="#00A651" name="Spend ($)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Market Demand by Region</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={marketDemand} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="market" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="electronics" fill="#C8102E" name="Electronics" radius={[3,3,0,0]} />
                <Bar dataKey="food" fill="#00A651" name="Food" radius={[3,3,0,0]} />
                <Bar dataKey="medical" fill="#3b82f6" name="Medical" radius={[3,3,0,0]} />
                <Bar dataKey="it" fill="#eab308" name="IT" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Inventory Value by Category</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {Object.entries(
                state.inventory.reduce((acc, i) => {
                  acc[i.category] = (acc[i.category] || 0) + i.qty * i.unitCost;
                  return acc;
                }, {})
              ).sort((a,b) => b[1]-a[1]).map(([cat, val], i) => {
                const max = Math.max(...state.inventory.reduce((acc, inv) => {
                  const existing = acc.find(a => a[0] === inv.category);
                  if (existing) existing[1] += inv.qty * inv.unitCost;
                  else acc.push([inv.category, inv.qty * inv.unitCost]);
                  return acc;
                }, []).map(x => x[1]));
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text2)' }}>{cat}</span>
                      <span style={{ fontWeight: 600 }}>${val.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(val/max)*100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Supplier Performance Comparison</span></div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={[
                { metric: 'Score', ...Object.fromEntries(state.suppliers.slice(0,3).map(s => [s.name.split(' ')[0], s.score])) },
                { metric: 'On-Time', ...Object.fromEntries(state.suppliers.slice(0,3).map(s => [s.name.split(' ')[0], s.onTimeRate])) },
                { metric: 'Quality', ...Object.fromEntries(state.suppliers.slice(0,3).map(s => [s.name.split(' ')[0], 100 - s.defectRate * 10])) },
                { metric: 'Orders', ...Object.fromEntries(state.suppliers.slice(0,3).map(s => [s.name.split(' ')[0], Math.min(s.totalOrders * 1.5, 100)])) },
                { metric: 'Spend%', ...Object.fromEntries(state.suppliers.slice(0,3).map(s => [s.name.split(' ')[0], Math.round(s.spend / 1500000 * 100)])) },
              ]}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text2)' }} />
                {state.suppliers.slice(0,3).map((s, i) => (
                  <Radar key={s.id} name={s.name.split(' ')[0]} dataKey={s.name.split(' ')[0]} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                ))}
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text2)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Supplier Scorecard</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Supplier</th><th>Score</th><th>On-Time</th><th>Defect</th><th>Status</th></tr></thead>
                <tbody>
                  {state.suppliers.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500, fontSize: 12 }}>{s.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-fill" style={{ width: `${s.score}%`, background: s.score >= 85 ? 'var(--green)' : s.score >= 70 ? '#eab308' : 'var(--red)' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{s.score}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: s.onTimeRate >= 90 ? 'var(--green)' : '#eab308' }}>{s.onTimeRate}%</td>
                      <td style={{ fontSize: 12, color: s.defectRate > 2 ? 'var(--red)' : 'var(--text)' }}>{s.defectRate}%</td>
                      <td><span className={`badge badge-${s.status === 'active' ? 'green' : s.status === 'suspended' ? 'red' : 'yellow'}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
