import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  ArrowLeft, 
  LayoutDashboard, 
  List, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  DollarSign, 
  Eye, 
  X,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Linkedin,
  Twitch,
  Music,
  Send,
  Video,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabaseService } from './services/supabaseService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPlatformIcon = (text: string, size = 18) => {
  const t = text.toLowerCase();
  if (t.includes('instagram')) return <Instagram size={size} className="text-pink-600" />;
  if (t.includes('youtube')) return <Youtube size={size} className="text-red-600" />;
  if (t.includes('tiktok')) return <Video size={size} className="text-slate-900" />;
  if (t.includes('facebook')) return <Facebook size={size} className="text-blue-600" />;
  if (t.includes('twitter') || t.includes(' x ')) return <Twitter size={size} className="text-sky-500" />;
  if (t.includes('telegram')) return <Send size={size} className="text-sky-400" />;
  if (t.includes('linkedin')) return <Linkedin size={size} className="text-blue-700" />;
  if (t.includes('spotify')) return <Music size={size} className="text-emerald-500" />;
  if (t.includes('twitch')) return <Twitch size={size} className="text-purple-600" />;
  return <Globe size={size} className="text-slate-400" />;
};


export function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'funds'>('orders');
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [fundRequests, setFundRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ category: '', name: '', rate: '', min: '', max: '', description: '' });
  const [formError, setFormError] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const fetchServices = async () => {
    try {
      const data = await supabaseService.getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await supabaseService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFundRequests = async () => {
    try {
      const data = await supabaseService.getAllFundRequests();
      setFundRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchServices(), fetchOrders(), fetchFundRequests()]).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await supabaseService.updateOrderStatus(orderId, newStatus);
      await supabaseService.logAction(user.id, 'Update Order Status', `Order ID: ${orderId}, New Status: ${newStatus}`);
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    try {
      await supabaseService.bulkUpdateOrderStatus(selectedOrders, newStatus);
      await supabaseService.logAction(user.id, 'Bulk Update Order Status', `Order IDs: ${selectedOrders.join(', ')}, New Status: ${newStatus}`);
      fetchOrders();
      setSelectedOrders([]);
    } catch (err) {
      console.error(err);
      alert('Failed to update statuses');
    }
  };

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const handleFundRequestStatus = async (id: number, status: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await supabaseService.updateFundRequestStatus(id, status);
      await supabaseService.logAction(user.id, 'Update Fund Request Status', `Request ID: ${id}, New Status: ${status}`);
      await fetchFundRequests();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update fund request status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenModal = (service?: any) => {
    setFormError('');
    if (service) {
      setEditingService(service);
      setFormData({
        category: service.category,
        name: service.name,
        rate: service.rate.toString(),
        min: service.min.toString(),
        max: service.max.toString(),
        description: service.description || ''
      });
    } else {
      setEditingService(null);
      setFormData({ category: '', name: '', rate: '', min: '', max: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const rate = parseFloat(formData.rate);
    const min = parseInt(formData.min);
    const max = parseInt(formData.max);

    if (isNaN(rate) || rate < 0) {
      setFormError('Please enter a valid rate.');
      return;
    }
    if (isNaN(min) || min < 1) {
      setFormError('Please enter a valid minimum quantity.');
      return;
    }
    if (isNaN(max) || max < 1) {
      setFormError('Please enter a valid maximum quantity.');
      return;
    }
    if (min > max) {
      setFormError('Minimum quantity cannot be greater than maximum quantity.');
      return;
    }

    const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
    const method = editingService ? 'PUT' : 'POST';
    
    try {
      const serviceData = {
        category: formData.category,
        name: formData.name,
        rate,
        min,
        max,
        description: formData.description
      };

      if (editingService) {
        await supabaseService.updateService(editingService.id, serviceData);
      } else {
        await supabaseService.createService(serviceData);
      }
      
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      alert('Failed to save service');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await supabaseService.deleteService(id);
        fetchServices();
      } catch (err) {
        console.error(err);
        alert('Failed to delete service');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = orderSearchQuery.toLowerCase();
    return (
      order.id.toString().includes(q) ||
      order.username.toLowerCase().includes(q) ||
      order.link.toLowerCase().includes(q)
    );
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id: number) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading admin dashboard...</div>;

  return (
    <div className="bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-red-600" /> Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Manage your platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
                  activeTab === 'orders' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <LayoutDashboard size={16} /> Orders
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
                  activeTab === 'services' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <List size={16} /> Services
              </button>
              <button
                onClick={() => setActiveTab('funds')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
                  activeTab === 'funds' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <DollarSign size={16} /> Fund Requests
                {fundRequests.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {fundRequests.filter(r => r.status === 'Pending').length}
                  </span>
                )}
              </button>
            </div>
            {activeTab === 'services' && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Add Service
              </button>
            )}
          </div>
        </div>

        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Service Name</th>
                    <th className="px-6 py-4 font-medium">Rate ($)</th>
                    <th className="px-6 py-4 font-medium">Min / Max</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {services.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{s.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(s.category)}
                          {s.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={s.name}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(s.name)}
                          {s.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-600">${s.rate.toFixed(4)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{s.min} / {s.max}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(s)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No services found. Add one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="Search by Order ID, User, or Link..."
                />
              </div>
              
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                  <span className="text-sm font-medium text-slate-600">
                    {selectedOrders.length} selected
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkStatusChange(e.target.value);
                        e.target.value = ''; // Reset select after action
                      }
                    }}
                    className="text-sm font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  >
                    <option value="">Change Status...</option>
                    <option value="Pending">Pending</option>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Partial">Partial</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium w-10">
                      <input
                        type="checkbox"
                        checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Service</th>
                    <th className="px-6 py-4 font-medium">Link</th>
                    <th className="px-6 py-4 font-medium">Quantity</th>
                    <th className="px-6 py-4 font-medium">Charge</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className={cn("hover:bg-slate-50 transition-colors", selectedOrders.includes(order.id) && "bg-indigo-50/50")}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{order.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.username}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={order.service_name}>{order.service_name}</td>
                      <td className="px-6 py-4 text-sm text-indigo-600 truncate max-w-[150px]">
                        <a href={order.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{order.link}</a>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">${order.charge.toFixed(4)}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer",
                            order.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            order.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            order.status === 'In progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            order.status === 'Partial' ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In progress">In progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Partial">Partial</option>
                          <option value="Canceled">Canceled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        {orderSearchQuery ? 'No orders match your search.' : 'No orders found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'funds' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fundRequests.map(request => (
                    <tr 
                      key={request.id} 
                      className={cn(
                        "hover:bg-slate-50 transition-colors",
                        request.status === 'Pending' && "bg-amber-50/40"
                      )}
                    >
                      <td className="px-6 py-4 text-sm text-slate-500">{request.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{request.username}</td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-600">${request.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(request.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold border",
                          request.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          request.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {request.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => handleFundRequestStatus(request.id, 'Approved')}
                                disabled={processingId === request.id}
                                className={cn(
                                  "px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                  processingId === request.id && "animate-pulse"
                                )}
                              >
                                {processingId === request.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleFundRequestStatus(request.id, 'Rejected')}
                                disabled={processingId === request.id}
                                className={cn(
                                  "px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                  processingId === request.id && "animate-pulse"
                                )}
                              >
                                {processingId === request.id ? '...' : 'Reject'}
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">Processed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fundRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No fund requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingService ? <Edit size={20} className="text-indigo-600" /> : <Plus size={20} className="text-indigo-600" />}
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {getPlatformIcon(formData.category)}
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Instagram Followers"
                />
                <p className="text-xs text-slate-500">Group similar services together.</p>
              </div>
              
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {getPlatformIcon(formData.name)}
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Instagram Followers [Real]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                  placeholder="Enter service description..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Rate per 1000 ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    required
                    step="0.0001"
                    min="0"
                    value={formData.rate}
                    onChange={e => setFormData({...formData, rate: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Min Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.min}
                    onChange={e => setFormData({...formData, min: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Max Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max}
                    onChange={e => setFormData({...formData, max: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}
              
              {parseInt(formData.min) > parseInt(formData.max) && formData.min && formData.max && !formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <p>Minimum quantity cannot be greater than maximum quantity.</p>
                </div>
              )}
              
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={parseInt(formData.min) > parseInt(formData.max)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Eye size={20} className="text-indigo-600" />
                Request Details
              </h3>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request ID</p>
                  <p className="text-slate-900 font-medium">#{selectedRequest.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold border inline-block",
                    selectedRequest.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                    selectedRequest.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {selectedRequest.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedRequest.username}</p>
                    <p className="text-xs text-slate-500">User ID: {selectedRequest.user_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-bold text-emerald-600">${selectedRequest.amount.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Requested</p>
                <p className="text-sm text-slate-700">{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
