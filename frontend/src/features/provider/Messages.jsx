import { useState } from 'react';
import { Send } from 'lucide-react';
import { ProviderLayout } from '../../layouts/AppLayout';
import { Avatar } from '../../components/ui';

const CONVOS = [
  { id: 1, name: 'Vikram S', ticket: 'TKT-2025-MOB-00023', lastMsg: 'When will the screen be ready?', time: '10 min ago', unread: 2, msgs: [
    { from: 'customer', text: 'Hi, just checking on my phone repair.', time: '9:30 AM' },
    { from: 'me', text: 'Hi Vikram! The parts arrived. Starting repair now.', time: '9:45 AM' },
    { from: 'customer', text: 'When will the screen be ready?', time: '10:00 AM' },
  ]},
  { id: 2, name: 'Ananya K', ticket: 'TKT-2025-LAP-00011', lastMsg: 'Great, thanks for the update!', time: '1h ago', unread: 0, msgs: [
    { from: 'me', text: 'Hi Ananya, laptop received. Starting diagnostics.', time: 'Yesterday 4:00 PM' },
    { from: 'customer', text: 'Great, thanks for the update!', time: 'Yesterday 4:15 PM' },
  ]},
  { id: 3, name: 'Rahul M', ticket: 'TKT-2025-PC-00003', lastMsg: 'Okay, awaiting pickup.', time: '2h ago', unread: 0, msgs: [
    { from: 'me', text: 'Job assigned. We\'ll pickup tomorrow morning.', time: '8:00 AM' },
    { from: 'customer', text: 'Okay, awaiting pickup.', time: '8:10 AM' },
  ]},
];

export function Messages() {
  const [active, setActive] = useState(CONVOS[0]);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState(CONVOS);

  const send = () => {
    if (!input.trim()) return;
    const newMsg = { from: 'me', text: input, time: 'Just now' };
    setChats(prev => prev.map(c => c.id === active.id ? { ...c, msgs: [...c.msgs, newMsg], lastMsg: input, unread: 0 } : c));
    setActive(prev => ({ ...prev, msgs: [...prev.msgs, newMsg] }));
    setInput('');
  };

  return (
    <ProviderLayout title="Messages">
      <div className="card flex overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Sidebar */}
        <div className="w-72 border-r border-surface-100 flex-shrink-0 overflow-y-auto">
          {chats.map(c => (
            <button key={c.id} onClick={() => setActive(c)} className={`w-full flex items-start gap-3 p-4 text-left border-b border-surface-50 transition-colors ${active.id === c.id ? 'bg-brand-50' : 'hover:bg-surface-50'}`}>
              <Avatar name={c.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-surface-900 truncate">{c.name}</p>
                  <span className="text-[10px] text-surface-400 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-xs font-mono text-surface-400 mb-0.5">{c.ticket}</p>
                <p className="text-xs text-surface-500 truncate">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && <span className="w-5 h-5 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</span>}
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-surface-100">
            <Avatar name={active.name} size="sm" />
            <div>
              <p className="text-sm font-semibold text-surface-900">{active.name}</p>
              <p className="text-[10px] font-mono text-surface-400">{active.ticket}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {active.msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${m.from === 'me' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-surface-100 text-surface-800 rounded-bl-sm'}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-brand-200' : 'text-surface-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-4 border-t border-surface-100">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." className="input flex-1 text-sm" />
            <button onClick={send} className="btn-primary px-3"><Send size={16} /></button>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
