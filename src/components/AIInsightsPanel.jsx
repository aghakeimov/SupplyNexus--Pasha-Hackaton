import React from 'react';
import { Brain, AlertTriangle, Zap, TrendingUp, CheckCircle, DollarSign, XCircle } from 'lucide-react';

const ICON_MAP = { critical: AlertTriangle, warning: Zap, info: TrendingUp, success: CheckCircle };
const COLOR_MAP = { critical: 'var(--red)', warning: '#f97316', info: '#3b82f6', success: 'var(--green)' };
const BG_MAP = { critical: 'rgba(200,16,46,0.08)', warning: 'rgba(249,115,22,0.08)', info: 'rgba(59,130,246,0.08)', success: 'rgba(0,166,81,0.08)' };

export default function AIInsightsPanel({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--green), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>AI Supply Chain Insights</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Auto-generated recommendations based on ABC-XYZ analysis</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((insight, i) => {
          const Icon = ICON_MAP[insight.type] || Zap;
          const color = COLOR_MAP[insight.type] || 'var(--text2)';
          const bg = BG_MAP[insight.type] || 'var(--bg3)';
          return (
            <div key={i} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 'var(--radius)', padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all 0.2s' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: color, marginBottom: 4 }}>{insight.icon} {insight.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{insight.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
