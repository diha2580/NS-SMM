import { supabase } from '../lib/supabase';

export const supabaseService = {
  // Auth
  async signUp(username: string, email: string, password: string) {
    // Supabase Auth uses email/password. We can store username in metadata or a profiles table.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
    
    // Create profile entry
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, username, email, balance: 0 }]);
      if (profileError) console.error('Error creating profile:', profileError);
    }
    
    return data;
  },

  async signIn(emailOrUsername: string, password: string) {
    // If it's a username, we need to find the email first
    let email = emailOrUsername;
    if (!emailOrUsername.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailOrUsername)
        .single();
      if (profile) email = profile.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return profile;
  },

  // Services
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createService(service: any) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateService(id: number, updates: any) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteService(id: number) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Orders
  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        services (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(o => ({ ...o, service_name: o.services?.name }));
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        services (name),
        profiles (username)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(o => ({ 
      ...o, 
      service_name: o.services?.name,
      username: o.profiles?.username
    }));
  },

  async createOrder(order: any) {
    // We need to handle balance check and update atomically if possible
    // In Supabase, we can use a RPC or just do it in sequence for now (less safe but simpler)
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', order.user_id)
      .single();
    
    if (!profile || profile.balance < order.charge) {
      throw new Error('Insufficient balance');
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - order.charge })
      .eq('id', order.user_id);
    
    if (balanceError) throw balanceError;

    // Create order
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: number, status: string) {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (status === 'Canceled' && order && order.status !== 'Canceled') {
      // Refund
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', order.user_id)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance + order.charge })
          .eq('id', order.user_id);
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async bulkUpdateOrderStatus(orderIds: number[], status: string) {
    // For bulk updates, we can use .in()
    // However, if status is 'Canceled', we need to refund each user.
    // This is complex for a single query. For now, let's do it in a loop or just update status.
    // To be safe with refunds, we'd need a stored procedure.
    
    if (status === 'Canceled') {
      for (const id of orderIds) {
        await this.updateOrderStatus(id, status);
      }
    } else {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .in('id', orderIds);
      if (error) throw error;
    }
  },

  // Fund Requests
  async getFundRequests(userId: string) {
    const { data, error } = await supabase
      .from('fund_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllFundRequests() {
    const { data, error } = await supabase
      .from('fund_requests')
      .select(`
        *,
        profiles (username)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(f => ({ ...f, username: f.profiles?.username }));
  },

  async createFundRequest(request: any) {
    const { data, error } = await supabase
      .from('fund_requests')
      .insert([request])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFundRequestStatus(id: number, status: string) {
    const { data: request } = await supabase
      .from('fund_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!request || request.status !== 'Pending') {
      throw new Error('Request already processed or not found');
    }

    if (status === 'Approved') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', request.user_id)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance + request.amount })
          .eq('id', request.user_id);
      }
    }

    const { data, error } = await supabase
      .from('fund_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async logAction(adminId: string, action: string, details: string) {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{ admin_id: adminId, action, details }]);
    if (error) throw error;
  }
};
