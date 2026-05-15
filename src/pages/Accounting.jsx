import React, { useState, useMemo } from 'react';
import { useStore } from '../store/StoreContext';
import { DollarSign, TrendingUp, TrendingDown, FileText, BookOpen, CreditCard, PieChart, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart as RPie, Pie, Cell } from 'recharts';
import { exportSalesOrderPDF } from '../services/pdfExport';

const COLORS = ['#C8102E','#00A651','#3b82f6','#f97316','#eab308','#8b5cf6','#06b6d4','#ec4899'];

// Auto-generate journal entries from POs and Sales Orders
function generateJournalEntries(pos, sos) {
  const entries = [];
  pos.forEach(po => {
    entries.push({ id: `JE-${po.id}`, date: po.created, type: 'Purchase', ref: po.id, account: 'Inventory / Stock', debit: po.total, credit: 0, description: `PO from ${po.supplier}`, status: po.status === 'delivered' ? 'posted' : 'pending' });
    entries.push({ id: `JE-${po.id}-AP`, date: po.created, type: 'Purchase', ref: po.id, account: 'Accounts Payable', debit: 0, credit: po.total, description: `Payable to ${po.supplier}`, status: po.status === 'delivered' ? 'posted' : 'pending' });
  });
  sos.forEach(so => {
    entries.push({ id: `JE-${so.id}`, date: so.date, type: 'Sale', ref: so.id, account: 'Accounts Receivable', debit: so.total, credit: 0, description: `Invoice to ${so.customer}`, status: so.paymentStatus === 'paid' || so.paymentStatus === 'internal' ? 'posted' : 'pending' });
    entries.push({ id: `JE-${so.id}-REV`, date: so.date, type: 'Sale', ref: so.id, account: 'Sales Revenue', debit: 0, credit: so.subtotal, description: `Revenue from ${so.customer}`, status: so.paymentStatus === 'paid' || so.paymentStatus === 'internal' ? 'posted' : 'pending' });
    if (so.tax > 0) {
      entries.push({ id: `JE-${so.id}-TAX`, date: so.date, type: 'Tax', ref: so.id, account: 'VAT Payable', debit: 0, credit: so.tax, description: `VAT on ${so.id}`, status: 'posted' });
    }
  });
  return entries;
}

const CHART_OF_ACCOUNTS = [
  { code: '1000', name: 'Cash & Bank', type: 'Asset', balance: 485000 },
  { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 0 },
  { code: '1200', name: 'Inventory / Stock', type: 'Asset', balance: 165000 },
  { code: '1300', name: 'Prepaid Expenses', type: 'Asset', balance: 12000 },
  { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0 },
  { code: '2100', name: 'VAT Payable', type: 'Liability', balance: 0 },
  { code: '2200', name: 'Salaries Payable', type: 'Liability', balance: 45000 },
  { code: '3000', name: 'Owner Equity', type: 'Equity', balance: 500000 },
  { code: '3100', name: 'Retained Earnings', type: 'Equity', balance: 120000 },
  { code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 0 },
  { code: '4100', name: 'Other Income', type: 'Revenue', balance: 8500 },
  { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: 0 },
  { code: '5100', name: 'Operating Expenses', type: 'Expense', balance: 35000 },
  { code: '5200', name: 'Logistics & Transport', type: 'Expense', balance: 18000 },
  { code: '5300', name: 'Staff Costs', type: 'Expense', balance: 95000 },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: PieChart },
  { id: 'journal', label: 'Journal Entries', icon: BookOpen },
  { id: 'accounts', label: 'Chart of Accounts', icon: FileText },
  { id: 'payable', label: 'Accounts Payable', icon: CreditCard },
  { id: 'receivable', label: 'Accounts Receivable', icon: DollarSign },
];

export default function Accounting() {
  const { state } = useStore();
  const [tab, setTab] = useState('overview');

  const data = useMemo(() => {
    const je = generateJournalEntries(state.purchaseOrders, state.salesOrders);
    const totalRevenue = state.salesOrders.filter(s => s.status !== 'cancelled').reduce((s, o) => s + (o.subtotal || 0), 0);
    const totalCOGS = state.purchaseOrders.filter(p => p.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
    const totalTax = state.salesOrders.reduce((s, o) => s + (o.tax || 0), 0);
    const totalExpenses = 35000 + 18000 + 95000;
    const grossProfit = totalRevenue - totalCOGS;
    const netIncome = grossProfit - totalExpenses;

    const ap = state.purchaseOrders.filter(p => p.status !== 'delivered').map(p => ({ ...p, outstanding: p.total, dueDate: p.delivery }));
    const ar = state.salesOrders.filter(s => s.paymentStatus !== 'paid' && s.paymentStatus !== 'internal' && s.status !== 'cancelled').map(s => ({ ...s, outstanding: s.total, dueDate: s.deliveryDate }));

    const accounts = CHART_OF_ACCOUNTS.map(a => {
      let bal = a.balance;
      if (a.code === '1100') bal = ar.reduce((s, r) => s + r.outstanding, 0);
      if (a.code === '2000') bal = ap.reduce((s, r) => s + r.outstanding, 0);
      if (a.code === '2100') bal = totalTax;
      if (a.code === '4000') bal = totalRevenue;
      if (a.code === '5000') bal = totalCOGS;
      return { ...a, balance: bal };
    });

    return { je, totalRevenue, totalCOGS, grossProfit, netIncome, totalTax, totalExpenses, ap, ar, accounts };
  }, [state.purchaseOrders, state.salesOrders]);

  const plData = [
    { name: 'Revenue', amount: data.totalRevenue },
    { name: 'COGS', amount: -data.totalCOGS },
    { name: 'Gross Profit', amount: data.grossProfit },
    { name: 'OpEx', amount: -data.totalExpenses },
    { name: 'Net Income', amount: data.netIncome },
  ];

  const pieData = [
    { name: 'COGS', value: data.totalCOGS },
    { name: 'Operations', value: 35000 },
    { name: 'Logistics', value: 18000 },
    { name: 'Staff', value: 95000 },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Accounting</div>
        <div className="page-sub">Financial ledger, journal entries, payables & receivables — Bravo Supermarket</div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card green"><span className="stat-label">Total Revenue</span><div className="stat-value">${(data.totalRevenue/1000).toFixed(1)}K</div></div>
        <div className="stat-card blue"><span className="stat-label">Gross Profit</span><div className="stat-value">${(data.grossProfit/1000).toFixed(1)}K</div></div>
        <div className="stat-card red"><span className="stat-label">Total Payable</span><div className="stat-value">${(data.ap.reduce((s,a) => s+a.outstanding,0)/1000).toFixed(1)}K</div></div>
        <div className="stat-card yellow"><span className="stat-label">Net Income</span><div className="stat-value" style={{ color: data.netIncome >= 0 ? 'var(--green)' : 'var(--red)' }}>${(data.netIncome/1000).toFixed(1)}K</div></div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16, display: 'inline-flex' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon size={13} />{t.label}</button>;
        })}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Income Statement (P&L)</span></div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => `$${v.toLocaleString()}`} />
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {plData.map((e, i) => <Cell key={i} fill={e.amount >= 0 ? '#00A651' : '#C8102E'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Expense Breakdown</span></div>
            <ResponsiveContainer width="100%" height={250}>
              <RPie><Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={45} dataKey="value" paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip formatter={v => `$${v.toLocaleString()}`} /></RPie>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', fontSize: 11 }}>
              {pieData.map((g, i) => <span key={i} style={{ color: COLORS[i] }}>● {g.name}</span>)}
            </div>
          </div>
          {/* Balance Sheet Summary */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><span className="card-title">Balance Sheet Summary</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {['Asset','Liability','Equity'].map(type => (
                <div key={type}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: type === 'Asset' ? 'var(--green)' : type === 'Liability' ? 'var(--red)' : '#3b82f6', marginBottom: 8, textTransform: 'uppercase' }}>{type}s</div>
                  {data.accounts.filter(a => a.type === type).map(a => (
                    <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}>{a.name}</span>
                      <span style={{ fontWeight: 600 }}>${a.balance.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, fontWeight: 800 }}>
                    <span>Total</span>
                    <span>${data.accounts.filter(a => a.type === type).reduce((s, a) => s + a.balance, 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      {tab === 'journal' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Journal Entries (Auto-Generated)</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Ref</th><th>Account</th><th>Debit</th><th>Credit</th><th>Description</th><th>Status</th></tr></thead>
              <tbody>
                {data.je.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{e.date}</td>
                    <td><span className={`badge badge-${e.type === 'Sale' ? 'green' : e.type === 'Purchase' ? 'blue' : 'yellow'}`}>{e.type}</span></td>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{e.ref}</span></td>
                    <td style={{ fontWeight: 500 }}>{e.account}</td>
                    <td style={{ fontWeight: 600, color: e.debit > 0 ? 'var(--green)' : 'var(--text3)' }}>{e.debit > 0 ? `$${e.debit.toLocaleString()}` : '—'}</td>
                    <td style={{ fontWeight: 600, color: e.credit > 0 ? 'var(--red)' : 'var(--text3)' }}>{e.credit > 0 ? `$${e.credit.toLocaleString()}` : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{e.description}</td>
                    <td><span className={`badge badge-${e.status === 'posted' ? 'green' : 'yellow'}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chart of Accounts */}
      {tab === 'accounts' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Chart of Accounts</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Account Name</th><th>Type</th><th>Balance</th></tr></thead>
              <tbody>
                {data.accounts.map(a => (
                  <tr key={a.code}>
                    <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600 }}>{a.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td><span className={`badge badge-${a.type === 'Asset' ? 'green' : a.type === 'Liability' ? 'red' : a.type === 'Equity' ? 'blue' : a.type === 'Revenue' ? 'green' : 'orange'}`}>{a.type}</span></td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>${a.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accounts Payable */}
      {tab === 'payable' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Accounts Payable (Outstanding POs)</span></div>
          {data.ap.length === 0 ? <div className="empty-state">No outstanding payables</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>PO</th><th>Supplier</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
                <tbody>
                  {data.ap.map(p => (
                    <tr key={p.id}>
                      <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{p.id}</span></td>
                      <td style={{ fontWeight: 500 }}>{p.supplier}</td>
                      <td style={{ fontWeight: 700, color: 'var(--red)' }}>${p.outstanding.toLocaleString()}</td>
                      <td><span className={`badge badge-${p.status === 'approved' ? 'blue' : 'yellow'}`}>{p.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{p.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Accounts Receivable */}
      {tab === 'receivable' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Accounts Receivable (Outstanding Invoices)</span></div>
          {data.ar.length === 0 ? <div className="empty-state">No outstanding receivables — all internal Bravo transfers</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Due Date</th><th>PDF</th></tr></thead>
                <tbody>
                  {data.ar.map(s => (
                    <tr key={s.id}>
                      <td><span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{s.id}</span></td>
                      <td style={{ fontWeight: 500 }}>{s.customer}</td>
                      <td style={{ fontWeight: 700, color: 'var(--green)' }}>${s.outstanding.toLocaleString()}</td>
                      <td><span className={`badge badge-${s.paymentStatus === 'paid' ? 'green' : 'yellow'}`}>{s.paymentStatus}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{s.dueDate}</td>
                      <td><button className="btn btn-sm btn-ghost" onClick={() => exportSalesOrderPDF(s)}><Download size={11} /> PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
