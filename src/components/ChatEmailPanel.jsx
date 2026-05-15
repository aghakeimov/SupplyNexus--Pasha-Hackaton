import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Search } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { sendChatEmail } from '../services/emailService';

export default function ChatEmailPanel() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_chat') || '[]'); } catch { return []; }
  });
  const [msg, setMsg] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [search, setSearch] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const endRef = useRef();

  useEffect(() => { localStorage.setItem('sn_chat', JSON.stringify(messages.slice(-100))); }, [messages]);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const contacts = [
    ...state.suppliers.map(s => ({ id: s.id, name: s.name, email: s.email, type: 'Supplier', contact: s.contact })),
    ...state.customers.map(c => ({ id: c.id, name: c.name, email: c.email, type: 'Store', contact: c.contact })),
  ].filter(c => c.email);

  const filtered = contacts.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const handleSend = () => {
    if (!msg.trim() || !recipient) return;
    const entry = { id: Date.now(), to: recipient.name, email: recipient.email, text: msg, time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }), date: new Date().toLocaleDateString() };
    setMessages(prev => [...prev, entry]);
    sendChatEmail({ to: recipient.email, subject: `Bravo SupplyNexus — Message to ${recipient.name}`, message: msg });
    setMsg('');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), #8B0019)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(200,16,46,0.5)', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <MessageCircle size={22} />
          {messages.length > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{messages.length}</span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, width: 380, height: 520, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', animation: 'slideUp 0.2s ease' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, var(--red), #8B0019)', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>📧 Chat & Email</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{recipient ? `To: ${recipient.name}` : 'Select a recipient'}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
          </div>

          {/* Recipient selector */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
            <div onClick={() => setShowContacts(!showContacts)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              <User size={14} color="var(--text3)" />
              <span style={{ flex: 1, color: recipient ? 'var(--text)' : 'var(--text3)' }}>
                {recipient ? `${recipient.name} (${recipient.email})` : 'Click to select recipient...'}
              </span>
            </div>
            {showContacts && (
              <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 6, background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
                  <div className="search-bar" style={{ padding: '4px 8px', minWidth: 0 }}>
                    <Search size={12} color="var(--text3)" />
                    <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 12 }} />
                  </div>
                </div>
                {filtered.map(c => (
                  <div key={c.id} onClick={() => { setRecipient(c); setShowContacts(false); setSearch(''); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                      <div style={{ color: 'var(--text3)', fontSize: 11 }}>{c.email}</div>
                    </div>
                    <span className={`badge badge-${c.type === 'Supplier' ? 'blue' : 'green'}`} style={{ fontSize: 10 }}>{c.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, marginTop: 40 }}>
                No messages yet. Select a recipient and start typing.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                <div style={{ background: 'rgba(200,16,46,0.15)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, color: 'var(--text)' }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'right', marginTop: 2 }}>
                  To: {m.to} · {m.time}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={recipient ? `Message to ${recipient.name}...` : 'Select recipient first...'}
              disabled={!recipient}
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <button onClick={handleSend} disabled={!recipient || !msg.trim()}
              style={{ background: 'var(--green)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', cursor: 'pointer', opacity: (!recipient || !msg.trim()) ? 0.5 : 1 }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
