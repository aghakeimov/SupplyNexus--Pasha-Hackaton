import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { AlertTriangle, ShoppingCart, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RISK_CFG = {
  stockout: { color: '#7f1d1d', bg: 'rgba(200,16,46,0.2)', label: 'STOCK-OUT', icon: '🚫' },
  critical: { color: '#C8102E', bg: 'rgba(200,16,46,0.12)', label: 'CRITICAL', icon: '🔴' },
  high: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'HIGH', icon: '🟠' },
  medium: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', label: 'MEDIUM', icon: '🟡' },
  low: { color: '#00A651', bg: 'rgba(0,166,81,0.12)', label: 'LOW', icon: '🟢' },
};

const URG_CFG = {
  IMMEDIATE: { color: '#C8102E', bg: 'rgba(200,16,46,0.15)' },
  URGENT: { color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  PLANNED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  MONITOR: { color: '#00A651', bg: 'rgba(0,166,81,0.15)' },
};

export function SafetyStockTab({ safetyStockResults }) {
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">Safety Stock & Reorder Points</span></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>SKU</th><th>Product</th><th>Current Qty</th><th>Safety Stock</th><th>Reorder Point</th><th>Days of Supply</th><th>Avg Daily</th><th>Lead Time</th><th>Status</th></tr></thead>
          <tbody>
            {safetyStockResults.map(item => {
              const pct = item.reorderPoint > 0 ? Math.min(100, (item.qty / item.reorderPoint) * 100) : 100;
              const sCfg = item.status === 'stockout' ? RISK_CFG.stockout : item.status === 'critical' ? RISK_CFG.critical : item.status === 'reorder' ? RISK_CFG.high : item.status === 'overstock' ? { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'OVERSTOCK' } : RISK_CFG.low;
              return (
                <tr key={item.sku}>
                  <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{item.sku}</span></td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: item.qty <= item.safetyStock ? 'var(--red)' : 'var(--text)' }}>{item.qty}</span>
                      <div style={{ flex: 1, minWidth: 60 }}>
                        <div className="progress-bar" style={{ height: 8 }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: pct < 40 ? 'var(--red)' : pct < 70 ? '#eab308' : 'var(--green)' }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#f97316' }}>{item.safetyStock}</td>
                  <td style={{ fontWeight: 600, color: '#3b82f6' }}>{item.reorderPoint}</td>
                  <td style={{ fontWeight: 700, color: item.daysOfSupply < 7 ? 'var(--red)' : item.daysOfSupply < 14 ? '#eab308' : 'var(--green)' }}>{item.daysOfSupply}d</td>
                  <td>{item.avgDailyDemand}/day</td>
                  <td>{item.leadTimeDays}d</td>
                  <td><span style={{ background: sCfg.bg, color: sCfg.color, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{sCfg.label || item.status.toUpperCase()}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StockOutRiskTab({ stockOutRisk }) {
  const [showChart, setShowChart] = useState(null);
  const critical = stockOutRisk.filter(i => ['stockout','critical','high'].includes(i.riskLevel));

  return (
    <div>
      {/* Risk Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {['stockout','critical','high','medium'].map(level => {
          const count = stockOutRisk.filter(i => i.riskLevel === level).length;
          const cfg = RISK_CFG[level];
          return (
            <div key={level} className="card" style={{ padding: 16, borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>{cfg.icon} {cfg.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>products</div>
            </div>
          );
        })}
      </div>

      {/* Depletion Chart for critical items */}
      {critical.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">Projected Stock Depletion (30 Days)</span></div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" type="number" domain={[0, 30]} tick={{ fill: 'var(--text3)', fontSize: 11 }} label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: 'var(--text3)' }} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend />
              {critical.slice(0, 4).map((item, i) => {
                const colors = ['#C8102E', '#f97316', '#eab308', '#3b82f6'];
                return <Area key={item.sku} data={item.depletionCurve} type="monotone" dataKey="qty" name={item.name} stroke={colors[i]} fill={`${colors[i]}22`} strokeWidth={2} />;
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Risk Table */}
      <div className="card">
        <div className="card-header"><span className="card-title">Stock-Out Risk Assessment</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Risk</th><th>SKU</th><th>Product</th><th>Current Qty</th><th>Daily Demand</th><th>Days Until Stockout</th><th>Trend</th><th>Demand Trend</th></tr></thead>
            <tbody>
              {stockOutRisk.map(item => {
                const cfg = RISK_CFG[item.riskLevel];
                return (
                  <tr key={item.sku}>
                    <td><span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{cfg.icon} {cfg.label}</span></td>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{item.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontWeight: 700 }}>{item.qty}</td>
                    <td>{item.adjustedDailyDemand}/day</td>
                    <td style={{ fontWeight: 800, fontSize: 16, color: cfg.color }}>{item.daysUntilStockout === 999 ? '∞' : item.daysUntilStockout}</td>
                    <td>{item.trendDirection === 'increasing' ? <TrendingUp size={16} color="#C8102E" /> : item.trendDirection === 'decreasing' ? <TrendingDown size={16} color="#00A651" /> : <Minus size={14} color="var(--text3)" />}</td>
                    <td style={{ color: item.demandTrend > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{item.demandTrend > 0 ? '+' : ''}{item.demandTrend}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ReorderTab({ recommendations, onCreatePO, notify }) {
  const totalCost = recommendations.reduce((s, r) => s + r.estimatedCost, 0);
  const immCount = recommendations.filter(r => r.urgency === 'IMMEDIATE').length;

  return (
    <div>
      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card red"><span className="stat-label">Pending Reorders</span><div className="stat-value">{recommendations.length}</div></div>
        <div className="stat-card orange"><span className="stat-label">Immediate Orders</span><div className="stat-value">{immCount}</div></div>
        <div className="stat-card blue"><span className="stat-label">Total Est. Cost</span><div className="stat-value">${(totalCost / 1000).toFixed(0)}K</div></div>
        <div className="stat-card green"><span className="stat-label">Suppliers Involved</span><div className="stat-value">{new Set(recommendations.map(r => r.supplier)).size}</div></div>
      </div>

      {/* Reorder Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Smart Reorder Recommendations</span>
          <button className="btn btn-primary btn-sm" onClick={() => {
            recommendations.filter(r => r.urgency === 'IMMEDIATE').forEach(r => onCreatePO(r));
            if (notify) notify('Emergency POs generated for immediate items', 'success');
          }}>
            <ShoppingCart size={12} /> Generate All Urgent POs
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Priority</th><th>Cell</th><th>SKU</th><th>Product</th><th>Suggested Qty</th><th>EOQ</th><th>Supplier</th><th>Est. Cost</th><th>Order By</th><th>Action</th></tr></thead>
            <tbody>
              {recommendations.map(r => {
                const ucfg = URG_CFG[r.urgency] || URG_CFG.MONITOR;
                return (
                  <tr key={r.sku}>
                    <td><span style={{ background: ucfg.bg, color: ucfg.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.urgency}</span></td>
                    <td><span style={{ background: `${r.cellMeta?.color || '#666'}22`, color: r.cellMeta?.color || '#666', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>{r.cell}</span></td>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{r.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>{r.suggestedQty} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text3)' }}>{r.unit}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{r.eoq}</td>
                    <td style={{ fontSize: 12 }}>{r.supplierName}</td>
                    <td style={{ fontWeight: 600 }}>${r.estimatedCost.toLocaleString()}</td>
                    <td style={{ fontSize: 12, color: r.urgency === 'IMMEDIATE' ? 'var(--red)' : 'var(--text2)' }}>{r.orderByDate}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={() => { onCreatePO(r); if (notify) notify(`PO created for ${r.name}`, 'success'); }}>
                        <ShoppingCart size={11} /> Create PO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
