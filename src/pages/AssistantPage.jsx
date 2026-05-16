import React from 'react';
import AIAssistant from '../components/AIAssistant';
import { useStore } from '../store/StoreContext';
import { Zap, Package, Truck, Users, ShoppingCart, BarChart3, AlertTriangle, LayoutDashboard, Box } from 'lucide-react';

const useCases = [
  { icon: LayoutDashboard, title: 'Executive KPI Overview', desc: 'Get a high-level summary of your entire supply chain performance', prompt: 'Provide an executive KPI overview' },
  { icon: AlertTriangle, title: 'Waste & Spoilage', desc: 'Analyze product loss and identify areas for process improvement', prompt: 'Show me the latest waste and spoilage analysis' },
  { icon: Box, title: 'Warehouse Analytics', desc: 'Check storage capacity, utilization, and stock movements', prompt: 'What is our warehouse capacity and utilization?' },
  { icon: Package, title: 'ABC Classification', desc: 'Classify inventory items based on revenue contribution', prompt: 'Perform ABC inventory classification' },
  { icon: Truck, title: 'Logistics Analysis', desc: 'Shipment risk assessment and carrier performance', prompt: 'Show me current shipment risks and delays' },
  { icon: BarChart3, title: 'Spend Optimization', desc: 'Cost-saving recommendations and budget insights', prompt: 'How can we optimize our supply chain spend?' },
];

export default function AssistantPage() {
  const { state } = useStore();
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--green), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,166,81,0.3)' }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div className="page-title">Intelligence Assistant</div>
            <div className="page-sub">Advanced supply chain decision support and analysis</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16, borderColor: 'rgba(0,166,81,0.2)', background: 'linear-gradient(135deg, rgba(0,166,81,0.05), rgba(200,16,46,0.05))' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Active Suppliers', value: state.suppliers.filter(s => s.status === 'active').length, color: 'var(--green)' },
                { label: 'Open POs', value: state.purchaseOrders.filter(p => ['pending','draft'].includes(p.status)).length, color: '#3b82f6' },
                { label: 'Stock Alerts', value: state.inventory.filter(i => i.qty <= i.minStock).length, color: '#eab308' },
                { label: 'Active Shipments', value: state.shipments.filter(s => s.status !== 'delivered').length, color: 'var(--green)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text2)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capabilities</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {useCases.map((uc, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <uc.icon size={13} color="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{uc.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{uc.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, height: 680, display: 'flex', flexDirection: 'column' }}>
          <AIAssistant context={{ inventory: state.inventory, purchaseOrders: state.purchaseOrders, suppliers: state.suppliers, shipments: state.shipments }} />
        </div>
      </div>
    </div>
  );
}
