import React, { useState, useEffect } from 'react';
import { supabaseService } from './services/supabaseService';
import { MessageSquare, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

export function Tickets({ user }: { user: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchTickets();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

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

  const fetchTicketMessages = async (ticketId: number) => {
    try {
      const data = await supabaseService.getTicketMessages(ticketId);
      setTicketMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await supabaseService.getOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await supabaseService.updateTicketStatus(selectedTicket.id, status);
      setSelectedTicket({ ...selectedTicket, status });
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ticket = await supabaseService.createTicket({
        user_id: user.id,
        subject,
        status: 'Pending',
        order_id: orderId || null
      });
      
      await supabaseService.addTicketMessage({
        ticket_id: ticket.id,
        user_id: user.id,
        message
      });

      setIsCreating(false);
      setSubject('');
      setMessage('');
      setOrderId('');
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

      {isCreating ? (
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
          <select
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 mb-4"
          >
            <option value="">Select an order (optional)</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                Order #{order.id} - {order.service_name}
              </option>
            ))}
          </select>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Message"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 mb-4 min-h-[150px]"
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      ) : selectedTicket ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
            <div className="flex gap-2">
              {selectedTicket.status === 'Pending' && (
                <>
                  <button onClick={() => handleUpdateStatus('Resolved')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm">Mark Resolved</button>
                  <button onClick={() => handleUpdateStatus('Closed')} className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-sm">Close</button>
                </>
              )}
              <button onClick={() => setSelectedTicket(null)} className="px-3 py-1.5 text-slate-600">Back</button>
            </div>
          </div>
          <div className="space-y-4">
            {ticketMessages.map((m: any) => (
              <div key={m.id} className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-900">{m.username || 'Admin'}</p>
                <p className="text-sm text-slate-700">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
              <tr key={t.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(t)}>
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
