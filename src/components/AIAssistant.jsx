import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { getAIResponse } from '../services/aiEngine';
import { Send, Trash2, Zap } from 'lucide-react';

const suggestions = [
  'Show me the latest waste and spoilage analysis',
  'What is our warehouse capacity and utilization?',
  'Perform ABC inventory classification',
  'What is the current demand forecast?',
  'Provide an executive KPI overview',
  'How can I optimize our supply chain spend?',
];

export default function AIAssistant({ context = {} }) {
  const { state, dispatch } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (msg) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput('');
    dispatch({ type: 'ADD_AI_MSG', payload: { role: 'user', content: text, ts: new Date().toISOString() } });
    setLoading(true);
    try {
      const res = await getAIResponse(text, { inventory: state.inventory, purchaseOrders: state.purchaseOrders, ...context });
      dispatch({ type: 'ADD_AI_MSG', payload: { role: 'assistant', content: res, ts: new Date().toISOString() } });
    } catch (e) {
      dispatch({ type: 'ADD_AI_MSG', payload: { role: 'assistant', content: 'An error occurred. Please try again.', ts: new Date().toISOString() } });
    }
    setLoading(false);
  };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.includes('—')) {
        return <div key={i} style={{ fontWeight: 700, color: 'var(--text)', marginTop: i > 0 ? 6 : 0 }}>{line.replace(/\*\*/g, '')}</div>;
      }
      let parts = line.split(/(\*\*[^*]+\*\*)/g);
      return <div key={i} style={{ marginBottom: 2 }}>{parts.map((p, j) => p.startsWith('**') ? <strong key={j}>{p.replace(/\*\*/g, '')}</strong> : p)}</div>;
    });
  };

  return (
    <div className="ai-panel" style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Intelligence Assistant</span>
          {loading && <div className="ai-thinking"><div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/></div>}
        </div>
        <button className="btn-icon" onClick={() => dispatch({ type: 'CLEAR_AI' })} title="Clear conversation"><Trash2 size={13} /></button>
      </div>

      {state.aiHistory.length === 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Quick actions:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.borderColor = 'var(--green)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--text2)'; e.target.style.borderColor = 'var(--border)'; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, paddingRight: 4 }}>
        {state.aiHistory.map((msg, i) => (
          <div key={i} className={`ai-bubble ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence Assistant</div>
            )}
            <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)' }}>{renderContent(msg.content)}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>{new Date(msg.ts).toLocaleTimeString()}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-bubble assistant">
            <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence Assistant</div>
            <div className="ai-thinking"><div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/></div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input className="form-control" style={{ flex: 1 }} placeholder="Ask about suppliers, inventory, logistics..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="btn btn-success" onClick={() => send()} disabled={!input.trim() || loading} style={{ opacity: !input.trim() || loading ? 0.5 : 1 }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
