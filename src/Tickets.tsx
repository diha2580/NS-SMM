import React, { useState, useEffect } from 'react';
import { supabaseService } from './services/supabaseService';
import { MessageSquare, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

export function Tickets({ user }: { user: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await supabaseService.getTickets(user.id);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabaseService.createTicket({
        user_id: user.id,
        subject,
        status: 'Pending'
      });
      // Need to add the first message too
      // For now, let's keep it simple
      setIsCreating(false);
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to create ticket');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading tickets...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="text-indigo-600" /> Support Tickets
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Ticket</h2>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 mb-4"
            required
          />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Message"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 mb-4 min-h-[100px]"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tickets.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.subject}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold border",
                    t.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
