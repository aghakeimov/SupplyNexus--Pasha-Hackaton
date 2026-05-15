import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MATRIX_META } from '../services/warehouseAnalytics';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

const ABC_COLORS = { A: '#C8102E', B: '#f97316', C: '#eab308' };
const XYZ_COLORS = { X: '#00A651', Y: '#eab308', Z: '#C8102E' };

export default function ABCXYZPanel({ abcResults, xyzResults, matrix }) {
  const [selectedCell, setSelectedCell] = useState(null);

  const abcGroups = ['A','B','C'].map(c => ({
    name: `Class ${c}`, value: abcResults.filter(i => i.abcClass === c).reduce((s,i) => s + i.totalRevenue, 0),
    count: abcResults.filter(i => i.abcClass === c).length
  }));

  const xyzGroups = ['X','Y','Z'].map(c => ({
    name: `Class ${c}`, value: Object.values(xyzResults).filter(i => i.xyzClass === c).length
  }));

  const azItems = matrix['AZ']?.items || [];

  return (
    <div>
      {/* AZ Alert Banner */}
      {azItems.length > 0 && (
        <div style={{ background: 'rgba(200,16,46,0.12)', border: '1px solid rgba(200,16,46,0.3)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={20} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>⚠️ {azItems.length} Critical AZ Product(s) Detected</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
              {azItems.map(i => i.name).join(', ')} — High revenue contribution with erratic, unpredictable demand.
              These require maximum safety stock, frequent reorder cycles, and contingency suppliers.
            </div>
          </div>
        </div>
      )}

      {/* Matrix Grid + Pie Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* 3x3 Matrix */}
        <div className="card">
          <div className="card-header"><span className="card-title">ABC-XYZ Classification Matrix</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr', gridTemplateRows: '30px 1fr 1fr 1fr', gap: 6 }}>
            <div />
            {['X (Stable)','Y (Variable)','Z (Erratic)'].map(h => (
              <div key={h} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>{h}</div>
            ))}
            {['A','B','C'].map(abc => (
              <React.Fragment key={abc}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ABC_COLORS[abc] }}>{abc}</div>
                {['X','Y','Z'].map(xyz => {
                  const cell = abc + xyz;
                  const meta = MATRIX_META[cell];
                  const data = matrix[cell] || { count: 0, totalRevenue: 0, items: [] };
                  const isSelected = selectedCell === cell;
                  return (
                    <div key={cell} onClick={() => setSelectedCell(isSelected ? null : cell)}
                      style={{
                        background: isSelected ? meta.color : `${meta.color}22`,
                        border: `2px solid ${meta.color}${isSelected ? '' : '44'}`,
                        borderRadius: 10, padding: 12, cursor: 'pointer',
                        transition: 'all 0.2s', textAlign: 'center',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: isSelected ? '#fff' : meta.color }}>{data.count}</div>
                      <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text3)', marginTop: 2 }}>{cell}</div>
                      <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text3)' }}>
                        ${(data.totalRevenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 10, background: 'var(--bg3)', borderRadius: 8, fontSize: 11, color: 'var(--text3)' }}>
            Click any cell to see product details below
          </div>
        </div>

        {/* Pie Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><span className="card-title">ABC Revenue Distribution</span></div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart><Pie data={abcGroups} cx="50%" cy="50%" outerRadius={55} innerRadius={30} dataKey="value" paddingAngle={3}>
                {abcGroups.map((e,i) => <Cell key={i} fill={Object.values(ABC_COLORS)[i]} />)}
              </Pie><Tooltip formatter={v => `$${(v/1000).toFixed(0)}K`} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11 }}>
              {abcGroups.map((g,i) => (
                <span key={i} style={{ color: Object.values(ABC_COLORS)[i] }}>● {g.name} ({g.count})</span>
              ))}
            </div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><span className="card-title">XYZ Demand Stability</span></div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart><Pie data={xyzGroups} cx="50%" cy="50%" outerRadius={55} innerRadius={30} dataKey="value" paddingAngle={3}>
                {xyzGroups.map((e,i) => <Cell key={i} fill={Object.values(XYZ_COLORS)[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11 }}>
              {xyzGroups.map((g,i) => (
                <span key={i} style={{ color: Object.values(XYZ_COLORS)[i] }}>● {g.name} ({g.value})</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Cell Detail */}
      {selectedCell && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: MATRIX_META[selectedCell].color, color: '#fff', padding: '2px 10px', borderRadius: 6, fontWeight: 800 }}>{selectedCell}</span>
              {MATRIX_META[selectedCell].label}
            </span>
            <span className={`badge badge-${MATRIX_META[selectedCell].risk === 'critical' ? 'red' : MATRIX_META[selectedCell].risk === 'high' ? 'orange' : MATRIX_META[selectedCell].risk === 'medium' ? 'yellow' : 'green'}`}>
              {MATRIX_META[selectedCell].risk.toUpperCase()} RISK
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
            <Shield size={14} style={{ display: 'inline', marginRight: 6 }} />
            <strong>Strategy:</strong> {MATRIX_META[selectedCell].strategy}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>SKU</th><th>Product</th><th>Revenue</th><th>Rev %</th><th>CV</th><th>Avg Monthly</th><th>ABC</th><th>XYZ</th></tr></thead>
              <tbody>
                {(matrix[selectedCell]?.items || []).map(item => (
                  <tr key={item.sku}>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{item.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontWeight: 600 }}>${item.totalRevenue.toLocaleString()}</td>
                    <td>{item.revenuePct?.toFixed(1)}%</td>
                    <td><span style={{ color: item.cv > 0.5 ? 'var(--red)' : item.cv > 0.25 ? '#eab308' : 'var(--green)', fontWeight: 600 }}>{item.cv}</span></td>
                    <td>{item.mean}</td>
                    <td><span style={{ color: ABC_COLORS[item.abcClass], fontWeight: 700 }}>{item.abcClass}</span></td>
                    <td><span style={{ color: XYZ_COLORS[item.xyzClass], fontWeight: 700 }}>{item.xyzClass}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Classification Table */}
      <div className="card">
        <div className="card-header"><span className="card-title">All Products Classification</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Total Revenue</th><th>Cumulative %</th><th>CV</th><th>ABC</th><th>XYZ</th><th>Cell</th><th>Risk</th></tr></thead>
            <tbody>
              {abcResults.map(item => {
                const xyz = xyzResults[item.sku] || { xyzClass: '?', cv: 0 };
                const cell = item.abcClass + xyz.xyzClass;
                const meta = MATRIX_META[cell] || {};
                return (
                  <tr key={item.sku}>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{item.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td><span className="tag">{item.category}</span></td>
                    <td style={{ fontWeight: 600 }}>${item.totalRevenue.toLocaleString()}</td>
                    <td>{item.cumulativePct.toFixed(1)}%</td>
                    <td style={{ color: xyz.cv > 0.5 ? 'var(--red)' : xyz.cv > 0.25 ? '#eab308' : 'var(--green)', fontWeight: 600 }}>{xyz.cv}</td>
                    <td><span style={{ color: ABC_COLORS[item.abcClass], fontWeight: 800, fontSize: 15 }}>{item.abcClass}</span></td>
                    <td><span style={{ color: XYZ_COLORS[xyz.xyzClass], fontWeight: 800, fontSize: 15 }}>{xyz.xyzClass}</span></td>
                    <td><span style={{ background: `${meta.color}22`, color: meta.color, padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>{cell}</span></td>
                    <td><span className={`badge badge-${meta.risk === 'critical' ? 'red' : meta.risk === 'high' ? 'orange' : meta.risk === 'medium' ? 'yellow' : 'green'}`}>{meta.risk}</span></td>
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
