import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Truck, Users, BarChart3, MessageSquare, ChevronLeft, ChevronRight, Bell, Settings, LogOut, Menu, X, FileText, Calculator } from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales & Invoices', icon: FileText },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
  { id: 'warehouse', label: 'Warehouse', icon: Package },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'suppliers', label: 'Suppliers', icon: Users },
  { id: 'accounting', label: 'Accounting', icon: Calculator },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
];

export default function Layout({ children, page, setPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--red), #8B0019)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(200,16,46,0.4)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" fill="#00A651"/>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>SupplyNexus</div>
          <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 500, letterSpacing: '0.05em' }}>ENTERPRISE SCM</div>
        </div>
      )}
    </div>
  );

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = page === item.id;
    return (
      <button onClick={() => { setPage(item.id); setMobileOpen(false); }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '11px 16px' : '11px 16px', background: active ? 'rgba(200,16,46,0.12)' : 'none', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'var(--transition)', position: 'relative', color: active ? 'var(--red)' : 'var(--text2)', marginBottom: 2 }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)'; } }}>
        {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: 'var(--red)', borderRadius: '0 3px 3px 0' }} />}
        <Icon size={18} style={{ flexShrink: 0 }} />
        {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>}
        {!collapsed && item.id === 'assistant' && (
          <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 6px', background: 'linear-gradient(90deg, var(--green), var(--red))', borderRadius: 10, color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>AI</span>
        )}
      </button>
    );
  };

  const Sidebar = ({ style }) => (
    <div style={{ width: collapsed ? 64 : 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0, transition: 'width 0.2s ease', position: 'relative', ...style }}>
      <Logo />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {nav.map(item => <NavItem key={item.id} item={item} />)}
      </div>
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>EA</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Elchin Admin</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>SCM Manager</div>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, padding: '8px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', borderRadius: 6, transition: 'var(--transition)', fontSize: 12 }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'none'; }}>
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'flex' }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>
            <Sidebar style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: 56, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMobileOpen(true)} className="btn-icon" style={{ display: 'none' }} id="mobile-menu-btn"><Menu size={18} /></button>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                {nav.find(n => n.id === page)?.label || 'Dashboard'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Pasha Bank Supply Chain Platform</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginRight: 8 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button className="btn-icon" title="Notifications"><Bell size={16} /></button>
            <button className="btn-icon" title="Settings"><Settings size={16} /></button>
            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>EA</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
