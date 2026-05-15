import React from 'react';
import { useStore } from '../store/StoreContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = { success: CheckCircle, error: AlertCircle, info: Info, warning: AlertTriangle };
const colors = { success: 'var(--green)', error: 'var(--red)', info: '#3b82f6', warning: '#eab308' };

export default function Notifications() {
  const { state, dispatch } = useStore();
  if (!state.notifications.length) return null;
  return (
    <div className="notification">
      {state.notifications.map(n => {
        const Icon = icons[n.type] || Info;
        return (
          <div key={n.id} className={`notif ${n.type}`}>
            <Icon size={16} color={colors[n.type]} />
            <span style={{ flex: 1, fontSize: 13 }}>{n.msg}</span>
            <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2 }}
              onClick={() => dispatch({ type: 'POP_NOTIF', payload: n.id })}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
