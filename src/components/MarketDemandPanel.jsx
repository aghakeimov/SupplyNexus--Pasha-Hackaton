import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, MapPin, Store } from 'lucide-react';

const COLORS = ['#C8102E', '#00A651', '#3b82f6', '#f97316', '#8b5cf6', '#eab308', '#06b6d4', '#ec4899'];

export default function MarketDemandPanel({ marketDemandData, marketRegions }) {
  const [selectedMarket, setSelectedMarket] = useState('all');

  const marketsToShow = selectedMarket === 'all'
    ? Object.keys(marketDemandData)
    : [selectedMarket];

  // Monthly revenue chart data
  const months = ['2024-01','2024-02','2024-03','2024-04','2024-05','2024-06','2024-07','2024-08','2024-09','2024-10','2024-11','2024-12'];
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyChartData = months.map((m, i) => {
    const row = { month: monthLabels[i] };
    marketsToShow.forEach(mk => {
      row[mk] = marketDemandData[mk]?.monthlyTotals[m] || 0;
    });
    return row;
  });

  // Top products per market
  const getTopProducts = (market) => {
    return marketDemandData[market]?.skuBreakdown?.slice(0, 5) || [];
  };

  return (
    <div>
      {/* Market Selector */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <MapPin size={16} color="var(--text3)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Market / Region:</span>
          <div className="tabs" style={{ display: 'inline-flex' }}>
            <button className={`tab ${selectedMarket === 'all' ? 'active' : ''}`} onClick={() => setSelectedMarket('all')}>All Markets</button>
            {Object.keys(marketDemandData).map(mk => (
              <button key={mk} className={`tab ${selectedMarket === mk ? 'active' : ''}`} onClick={() => setSelectedMarket(mk)}>{mk}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Market KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {marketsToShow.map((mk, i) => {
          const data = marketDemandData[mk];
          if (!data) return null;
          const region = marketRegions?.find(r => r.name === mk);
          return (
            <div key={mk} className="card" style={{ padding: 16, borderTop: `3px solid ${COLORS[i % COLORS.length]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{mk}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{region?.stores || '?'} stores · Zone {region?.zone || '?'}</div>
                </div>
                {data.trend > 5 ? <TrendingUp size={16} color="#C8102E" /> : data.trend < -5 ? <TrendingDown size={16} color="#00A651" /> : <Minus size={14} color="var(--text3)" />}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS[i % COLORS.length] }}>${(data.totalRevenue / 1000).toFixed(0)}K</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                Avg ${(data.avgMonthlyRevenue / 1000).toFixed(1)}K/mo · Trend: <span style={{ color: data.trend > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{data.trend > 0 ? '+' : ''}{data.trend}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">Monthly Revenue by Market</span></div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => `$${v.toLocaleString()}`} />
            <Legend />
            {marketsToShow.map((mk, i) => (
              <Bar key={mk} dataKey={mk} fill={COLORS[i % COLORS.length]} radius={[4,4,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products per Market */}
      <div style={{ display: 'grid', gridTemplateColumns: marketsToShow.length > 2 ? '1fr 1fr' : '1fr', gap: 20 }}>
        {marketsToShow.map((mk, i) => (
          <div key={mk} className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Store size={14} color={COLORS[i % COLORS.length]} /> Top Products — {mk}
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th><th>Share</th></tr></thead>
                <tbody>
                  {getTopProducts(mk).map((p, j) => {
                    const share = marketDemandData[mk]?.totalRevenue > 0 ? (p.totalRevenue / marketDemandData[mk].totalRevenue * 100) : 0;
                    return (
                      <tr key={p.sku}>
                        <td style={{ fontWeight: 700, color: COLORS[i % COLORS.length] }}>{j + 1}</td>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td>{p.totalQty.toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>${p.totalRevenue.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                              <div className="progress-fill" style={{ width: `${share}%`, background: COLORS[i % COLORS.length] }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
