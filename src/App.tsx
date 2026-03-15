import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  List, 
  ShoppingCart, 
  Wallet, 
  Menu, 
  X, 
  User,
  LogOut,
  ChevronDown,
  Settings,
  Search,
  ArrowUpDown,
  ChevronUp,
  Package,
  ExternalLink,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowLeft,
  AlertCircle,
  Hash,
  Edit,
  Trash2,
  Plus,
  ShieldAlert,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Linkedin,
  Twitch,
  Music,
  Send,
  Video,
  Globe,
  Share2,
  MessageSquare,
  Bot
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from './lib/utils';

import { AdminDashboard } from './Admin';
import { Tickets } from './Tickets';
import { AIChatBot } from './components/AIChatBot';
import { CurrencySwitcher } from './components/CurrencySwitcher';
import { useCurrency } from './components/CurrencyContext';
import { supabaseService } from './services/supabaseService';
import { supabase } from './lib/supabase';



const getPlatformIcon = (text: string, size = 18) => {
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

// --- Landing Page ---

function LandingPage({ onLogin }: { onLogin: (token: string, username: string) => void }) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (authMode === 'signup') {
      if (!formData.email) {
        setError('Email is required for sign up');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.username.includes('@') ? formData.username : '', // Need email for Supabase Auth
          password: formData.password
        });
        
        // If login by username, we need the email first
        if (error && !formData.username.includes('@')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', formData.username.toLowerCase().trim())
            .single();
          
          if (profile) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: profile.email,
              password: formData.password
            });
            if (loginError) throw loginError;
            onLogin(loginData.session?.access_token || '', formData.username);
            return;
          }
        }

        if (error) throw error;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user?.id)
          .single();
          
        onLogin(data.session?.access_token || '', profile?.username || data.user?.email || '');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { username: formData.username.toLowerCase().trim() }
          }
        });
        if (error) throw error;
        
        // Create profile
        if (data.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            username: formData.username.toLowerCase().trim(),
            email: formData.email.toLowerCase().trim(),
            balance: 0
          }]);
        }
        
        onLogin(data.session?.access_token || '', formData.username);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <nav className="absolute top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-20 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-indigo-600 font-bold text-2xl tracking-tight">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
              <path d="M12 10l-3 6h6l-3-6z"/>
            </svg>
            NS SMM
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <button className="hover:text-indigo-600 transition-colors">Services</button>
          <button className="hover:text-indigo-600 transition-colors">API</button>
          <button className="hover:text-indigo-600 transition-colors">Sign up</button>
          <button 
            onClick={onLogin}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-indigo-200"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 pt-32 pb-20 relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>

        {/* Left Content */}
        <div className="md:w-1/2 max-w-2xl text-center md:text-left mb-12 md:mb-0 z-10 md:pr-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 border border-indigo-100">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
            #1 NS SMM Provider Worldwide
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Scale Your Social <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Presence Instantly
            </span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
            The fastest, most reliable, and cheapest NS SMM panel for resellers, agencies, and influencers. High-quality services delivered in seconds.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">5M+</span>
              <span className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">Orders Completed</span>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">$0.01</span>
              <span className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">Starting Price</span>
            </div>
            <div className="w-px h-12 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">24/7</span>
              <span className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider">Active Support</span>
            </div>
          </div>
        </div>

        {/* Right Content - Auth Card */}
        <div className="md:w-1/2 flex justify-center md:justify-end z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 p-8 w-full border border-white transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                {authMode === 'login' ? 'Enter your credentials to access the panel' : 'Join the #1 NS SMM provider today'}
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {authMode === 'login' ? 'Username or Email' : 'Username'}
                </label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={authMode === 'login' ? "e.g. johndoe or john@example.com" : "e.g. johndoe"}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              
              {authMode === 'signup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  {authMode === 'login' && (
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Forgot?</a>
                  )}
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {authMode === 'signup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-6 shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {authMode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
              </button>

              <div className="text-center mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <div>
                  <span className="text-sm text-slate-500">
                    {authMode === 'login' ? 'New to NS SMM? ' : 'Already have an account? '}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setError('');
                      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                    }}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    {authMode === 'login' ? 'Create an account' : 'Sign in'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center text-white font-bold text-xl tracking-tight mb-4">
              <svg className="w-6 h-6 mr-2 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
                <path d="M12 10l-3 6h6l-3-6z"/>
              </svg>
              NS SMM
            </div>
            <p className="text-sm leading-relaxed mb-4">The world's largest and cheapest Social Media Marketing Panel for resellers and direct buyers. High quality, instant delivery.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Services</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Updates</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Tickets</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} NS SMM. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Components ---

function Sidebar({ isOpen, setIsOpen, isAdmin }: { isOpen: boolean, setIsOpen: (v: boolean) => void, isAdmin?: boolean }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'New Order', path: '/', icon: ShoppingCart },
    { name: 'Services', path: '/services', icon: List },
    { name: 'Orders', path: '/orders', icon: LayoutDashboard },
    { name: 'Add Funds', path: '/add-funds', icon: Wallet },
    { name: 'Tickets', path: '/tickets', icon: MessageSquare },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center text-white font-bold text-xl tracking-tight">
            <svg className="w-6 h-6 mr-2 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
              <path d="M12 10l-3 6h6l-3-6z"/>
            </svg>
            NS SMM
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon size={18} className={cn("mr-3", isActive ? "text-indigo-200" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function Header({ setIsOpen, user, onLogout }: { setIsOpen: (v: boolean) => void, user: any, onLogout: () => void }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animateBalance, setAnimateBalance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, convert } = useCurrency();

  useEffect(() => {
    if (user?.balance !== undefined) {
      setAnimateBalance(true);
      const timer = setTimeout(() => setAnimateBalance(false), 500);
      return () => clearTimeout(timer);
    }
  }, [user?.balance]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 relative z-30">
      <div className="flex items-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="text-slate-500 hover:text-slate-900 lg:hidden mr-4 bg-slate-100 p-2 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-4">
        <CurrencySwitcher />
        <Link 
          to="/"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-semibold transition-colors shadow-sm"
        >
          <ShoppingCart size={18} className="sm:mr-2" />
          <span className="hidden sm:inline">New Order</span>
        </Link>

        <div className={cn(
          "px-4 sm:px-5 py-2.5 rounded-2xl flex items-center border shadow-sm transition-all duration-300",
          animateBalance 
            ? "bg-emerald-200 border-emerald-300 scale-105 shadow-md shadow-emerald-200/50" 
            : "bg-emerald-50 border-emerald-100"
        )}>
          <Wallet 
            size={20} 
            className={cn(
              "mr-2 sm:mr-2.5 transition-colors duration-300",
              animateBalance ? "text-emerald-800" : "text-emerald-600"
            )} 
          />
          <span className={cn(
            "text-base sm:text-lg font-extrabold tracking-tight transition-colors duration-300",
            animateBalance ? "text-emerald-950" : "text-emerald-900"
          )}>
            {currency === 'USD' ? '$' : currency === 'BDT' ? '৳' : currency === 'EURO' ? '€' : '₹'}
            {convert(user?.balance || 0).toFixed(2)}
          </span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold text-slate-900 leading-none">{user?.username || 'User'}</div>
              <div className="text-xs text-slate-500 mt-1">Member</div>
            </div>
            <ChevronDown size={16} className={cn("text-slate-400 hidden sm:block transition-transform", isDropdownOpen && "rotate-180")} />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                onClick={() => { setIsDropdownOpen(false); alert('Account Settings clicked'); }}
              >
                <Settings size={16} className="mr-2 text-slate-400" />
                Account Settings
              </button>
              <div className="h-px bg-slate-200 my-1"></div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                onClick={() => { setIsDropdownOpen(false); onLogout(); }}
              >
                <LogOut size={16} className="mr-2 text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// --- Custom Select Component ---

function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  renderOption
}: { 
  options: any[], 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string,
  renderOption: (option: any) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => (opt.id?.toString() || opt) === value);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="w-full rounded-xl border-slate-300 border px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? renderOption(selectedOption) : <span className="text-slate-400">{placeholder}</span>}
        </div>
        <ChevronDown size={18} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt, idx) => {
            const val = opt.id?.toString() || opt;
            return (
              <div 
                key={idx}
                className={cn(
                  "px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2",
                  val === value ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                )}
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
              >
                {renderOption(opt)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Pages ---

function NewOrder({ user, fetchUser }: { user: any, fetchUser: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [charge, setCharge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    supabaseService.getServices()
      .then(data => {
        setServices(data);
        const cats = Array.from(new Set(data.map((s: any) => s.category))) as string[];
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0]);
      })
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  const filteredServices = services.filter(s => s.category === selectedCategory);
  const selectedService = services.find(s => s.id.toString() === selectedServiceId);

  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.find(s => s.id.toString() === selectedServiceId)) {
      setSelectedServiceId(filteredServices[0].id.toString());
    }
  }, [selectedCategory, filteredServices]);

  useEffect(() => {
    if (selectedService && quantity) {
      const q = parseInt(quantity);
      if (!isNaN(q)) {
        setCharge((selectedService.rate / 1000) * q);
      } else {
        setCharge(0);
      }
    } else {
      setCharge(0);
    }
  }, [selectedService, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (user.balance < charge) {
      setMessage({ type: 'error', text: 'Insufficient balance. Please add funds to place this order.' });
      setLoading(false);
      return;
    }

    try {
      const order = await supabaseService.createOrder({
        user_id: user.id,
        service_id: selectedServiceId,
        link,
        quantity: parseInt(quantity),
        charge,
        status: 'Pending'
      });
      
      setMessage({ type: 'success', text: `Order placed successfully! ID: ${order.id}` });
      setLink('');
      setQuantity('');
      fetchUser(); // Update balance
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Create New Order</h2>
          <p className="text-sm text-slate-500 mt-1">Select a service and place your order instantly.</p>
        </div>
        
        <div className="p-6">
          {message.text && (
            <div className={cn(
              "p-4 rounded-xl mb-6 text-sm font-medium",
              message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
            )}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                {getPlatformIcon(selectedCategory)}
                Category
              </label>
              <CustomSelect 
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                renderOption={(c) => (
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(c)}
                    <span>{c}</span>
                  </div>
                )}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                {getPlatformIcon(selectedService?.name || '')}
                Service
              </label>
              <CustomSelect 
                options={filteredServices}
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                renderOption={(s) => (
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(s.name)}
                    <span className="truncate">{s.id} - {s.name} - ${s.rate.toFixed(2)}</span>
                  </div>
                )}
              />
            </div>

            {selectedService && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-blue-800">
                  <div className="mb-2 sm:mb-0">
                    <span className="font-semibold">Rate:</span> ${selectedService.rate.toFixed(2)} per 1000
                  </div>
                  <div>
                    <span className="font-semibold">Min:</span> {selectedService.min} / <span className="font-semibold">Max:</span> {selectedService.max}
                  </div>
                </div>
                {selectedService.description && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap">
                    <p className="font-semibold text-slate-700 mb-1">Description:</p>
                    {selectedService.description}
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Link</label>
              <input 
                type="text" 
                required
                placeholder="https://instagram.com/p/..."
                className="w-full rounded-xl border-slate-300 border px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
              <input 
                type="number" 
                required
                min={selectedService?.min || 1}
                max={selectedService?.max || 1000000}
                className="w-full rounded-xl border-slate-300 border px-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-500 font-medium">Total Charge</span>
                <span className="text-2xl font-bold text-slate-900">${charge.toFixed(4)}</span>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !selectedService || !quantity || charge > (user?.balance || 0)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Services() {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    supabaseService.getServices()
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      const params = new URLSearchParams(location.search);
      const serviceId = params.get('id');
      if (serviceId) {
        const s = services.find((x: any) => x.id.toString() === serviceId);
        if (s) setSelectedService(s);
      }
    }
  }, [location.search, services]);

  const handleCloseModal = () => {
    setSelectedService(null);
    // Clear the URL parameter if it exists so it doesn't re-open on refresh
    const params = new URLSearchParams(location.search);
    if (params.has('id')) {
      params.delete('id');
      navigate({ search: params.toString() }, { replace: true });
    }
  };

  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];
    
    if (searchQuery) {
      result = result.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.rate - b.rate);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.rate - a.rate);
    }
    
    return result;
  }, [services, searchQuery, sortOrder]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Rate per 1000</th>
                <th className="px-6 py-4 font-medium">Min / Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8 animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder('none');
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Services List</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full"
              />
            </div>
            <button
              onClick={toggleSort}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-full sm:w-auto whitespace-nowrap"
            >
              <ArrowUpDown size={16} className={sortOrder !== 'none' ? 'text-indigo-600' : 'text-slate-400'} />
              Sort by Rate {sortOrder === 'asc' ? '(Low to High)' : sortOrder === 'desc' ? '(High to Low)' : ''}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer hover:text-slate-700 transition-colors" 
                  onClick={toggleSort}
                >
                  <div className="flex items-center gap-1">
                    Rate per 1000
                    {sortOrder === 'asc' && <ChevronUp size={14} className="text-indigo-600" />}
                    {sortOrder === 'desc' && <ChevronDown size={14} className="text-indigo-600" />}
                    {sortOrder === 'none' && <ArrowUpDown size={14} className="text-slate-400 opacity-50" />}
                  </div>
                </th>
                <th className="px-6 py-4 font-medium">Min / Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedServices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No services found matching your criteria.
                  </td>
                </tr>
              ) : filteredAndSortedServices.map(s => (
                <tr 
                  key={s.id} 
                  onClick={() => setSelectedService(s)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-slate-500">{s.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(s.category || s.name)}
                      {s.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">${s.rate.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.min} / {s.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Service Details</h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1 flex items-center gap-1">
                  {getPlatformIcon(selectedService.category || 'General', 14)}
                  {selectedService.category || 'General'}
                </div>
                <h4 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                  {getPlatformIcon(selectedService.name, 24)}
                  {selectedService.name}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-sm font-medium text-slate-500 mb-1">Rate per 1000</div>
                  <div className="text-2xl font-bold text-indigo-600">${selectedService.rate.toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-sm font-medium text-slate-500 mb-1">Order Limits</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {selectedService.min} <span className="text-slate-400 text-sm font-normal mx-1">to</span> {selectedService.max}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2">Description</h5>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {selectedService.description || "High-quality service with fast delivery. Perfect for boosting your social media presence. Please ensure your account is set to public before placing an order. Delivery usually starts within 0-1 hours."}
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Orders({ user }: { user: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (user) {
      supabaseService.getOrders(user.id)
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching orders:', err);
          setLoading(false);
        });
    }
  }, [user]);

  const filteredOrders = useMemo(() => {
    return statusFilter === 'All' 
      ? orders 
      : orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  if (loading) return <div className="text-center py-10 text-slate-500">Loading orders...</div>;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setExpandedOrderId(null);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    if (s === 'in progress') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (s === 'canceled') return 'bg-red-100 text-red-800 border border-red-200';
    if (s === 'partial') return 'bg-purple-100 text-purple-800 border border-purple-200';
    return 'bg-amber-100 text-amber-800 border border-amber-200'; // Pending or default
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const statuses = ['All', 'Pending', 'In progress', 'Completed', 'Canceled', 'Partial'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Order History</h2>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border",
                statusFilter === status 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Link</th>
              <th className="px-6 py-4 font-medium">Charge</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Package size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders yet</h3>
                      <p className="text-slate-500 mb-6 max-w-sm">You haven't placed any orders. Create your first order to get started.</p>
                      <Link 
                        to="/"
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <ShoppingCart size={18} className="mr-2" />
                        Create New Order
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <List size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 mb-4">No orders found with status "{statusFilter}".</p>
                      <button 
                        onClick={() => handleFilterChange('All')}
                        className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : paginatedOrders.map(o => (
              <React.Fragment key={o.id}>
                <tr 
                  onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                  className={cn(
                    "hover:bg-slate-50 transition-colors cursor-pointer",
                    expandedOrderId === o.id ? "bg-slate-50" : ""
                  )}
                >
                  <td className="px-6 py-4 text-sm text-slate-500">{o.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate" title={o.link}>{o.link}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">${o.charge.toFixed(4)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      getStatusBadge(o.status)
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    <ChevronDown size={18} className={cn("transition-transform duration-200", expandedOrderId === o.id && "rotate-180")} />
                  </td>
                </tr>
                {expandedOrderId === o.id && (
                  <tr className="bg-slate-50/50 border-t-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Service</span>
                          <Link 
                            to={`/services?id=${o.service_id}`}
                            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline inline-flex items-center group"
                          >
                            {o.service_name}
                            <ExternalLink size={14} className="ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Quantity</span>
                          <span className="text-slate-900 font-semibold">{o.quantity.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div>
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-medium">{filteredOrders.length}</span> results
            </div>
            <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
              <span>Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-md text-slate-700 text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mr-1"
            >
              Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
                disabled={page === '...'}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors",
                  page === currentPage 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : page === '...' 
                      ? "text-slate-400 cursor-default" 
                      : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-1"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddFunds({ user, fetchUser }: { user: any, fetchUser: () => void }) {
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [method, setMethod] = useState<'card' | 'bkash' | 'nagad'>('card');
  const [currency, setCurrency] = useState<'BDT' | 'USDT' | 'EUR' | 'INR'>('BDT');
  const [inputAmount, setInputAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);
  
  const [amountError, setAmountError] = useState('');
  const [trxError, setTrxError] = useState('');
  
  const CURRENCIES = {
    BDT: { rate: 130, symbol: '৳', min: 30, flag: '🇧🇩' },
    USDT: { rate: 1, symbol: '₮', min: 1, flag: '💵' },
    EUR: { rate: 0.92, symbol: '€', min: 1, flag: '🇪🇺' },
    INR: { rate: 83, symbol: '₹', min: 50, flag: '🇮🇳' }
  };
  
  const selectedCurrency = CURRENCIES[currency];
  const rawUsdAmount = inputAmount ? (parseFloat(inputAmount) / selectedCurrency.rate) : 0;
  const feeUsd = rawUsdAmount * 0.05;
  const creditedUsd = rawUsdAmount - feeUsd;
  
  const isAmountValid = inputAmount && parseFloat(inputAmount) >= selectedCurrency.min && !amountError;
  const trxRegex = /^[A-Za-z0-9]{8,15}$/;
  const isTrxValid = trxId && trxRegex.test(trxId) && !trxError;

  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const data = await supabaseService.getFundRequests(user.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText('01953800351');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputAmount);
    if (isNaN(val) || val < selectedCurrency.min) {
      setAmountError(`Minimum deposit amount is ${selectedCurrency.symbol}${selectedCurrency.min}`);
      return;
    }
    setAmountError('');
    setStep('payment');
    setMessage({ type: '', text: '' });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'bkash' || method === 'nagad') {
      if (!trxRegex.test(trxId)) {
        setTrxError('Transaction ID must be 8-15 alphanumeric characters');
        return;
      }
    }
    setTrxError('');

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await supabaseService.createFundRequest({
        user_id: user.id,
        amount: parseFloat(creditedUsd.toFixed(2)),
        status: 'Pending',
        method,
        trx_id: trxId
      });
      
      setMessage({ type: 'success', text: `Fund request for $${creditedUsd.toFixed(2)} submitted and is pending admin approval.` });
      
      setInputAmount('');
      setTrxId('');
      setStep('amount');
      fetchUser();
      fetchTransactions();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add funds' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {step === 'amount' ? (
          <>
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900">Add Funds</h2>
              <p className="text-sm text-slate-500 mt-1">Enter the amount you want to add to your account.</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleContinue} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Currency</label>
                  <div className="flex space-x-2 mb-6">
                    {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setCurrency(c); setAmountError(''); }}
                        className={cn(
                          "relative flex-1 py-3 rounded-xl text-sm font-semibold transition-all border flex flex-col items-center justify-center gap-1",
                          currency === c 
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm ring-1 ring-indigo-600" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        <span className="text-xl">{CURRENCIES[c].flag}</span>
                        <span>{c}</span>
                        {currency === c && (
                          <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount ({currency})</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className={cn("font-medium", amountError ? "text-red-500" : isAmountValid ? "text-emerald-500" : "text-slate-500")}>
                        {selectedCurrency.symbol}
                      </span>
                    </div>
                    <input 
                      type="number" 
                      required
                      min={selectedCurrency.min}
                      step="any"
                      placeholder={selectedCurrency.min.toString()}
                      className={cn(
                        "w-full rounded-xl border pl-8 pr-10 py-3 bg-white text-slate-900 focus:ring-2 outline-none transition-shadow",
                        amountError 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/30" 
                          : isAmountValid
                            ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/30"
                            : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                      )}
                      value={inputAmount}
                      onChange={(e) => {
                        setInputAmount(e.target.value);
                        if (amountError) setAmountError('');
                      }}
                      onBlur={() => {
                        const val = parseFloat(inputAmount);
                        if (inputAmount && (isNaN(val) || val < selectedCurrency.min)) {
                          setAmountError(`Minimum deposit amount is ${selectedCurrency.symbol}${selectedCurrency.min}`);
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {amountError ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : isAmountValid ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {amountError && (
                    <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> {amountError}
                    </p>
                  )}
                  
                  {inputAmount && !amountError && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Equivalent (USD)</span>
                        <span className="font-medium text-slate-700">${rawUsdAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Processing Fee (5%)</span>
                        <span className="font-medium text-red-500">-${feeUsd.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between">
                        <span className="font-medium text-slate-900">You will receive</span>
                        <span className="font-bold text-emerald-600">${creditedUsd.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {!inputAmount && !amountError && (
                    <p className="text-xs text-slate-500 mt-2">Minimum deposit: {selectedCurrency.symbol}{selectedCurrency.min} (Exchange rate: $1 = {selectedCurrency.symbol}{selectedCurrency.rate})</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={!inputAmount || parseFloat(inputAmount) < selectedCurrency.min}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center">
              <button 
                onClick={() => setStep('amount')}
                className="mr-3 p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Select Payment Method</h2>
                <p className="text-sm text-slate-500 mt-1">You are paying: <strong className="text-slate-900">{selectedCurrency.symbol}{inputAmount}</strong> (${rawUsdAmount.toFixed(2)})</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => { setMethod('card'); setMessage({ type: '', text: '' }); }}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    method === 'card' ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <span className="font-bold text-slate-600 text-xl">💳</span>
                  </div>
                  <span className={cn("text-sm font-semibold", method === 'card' ? "text-indigo-700" : "text-slate-600")}>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('bkash'); setMessage({ type: '', text: '' }); }}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    method === 'bkash' ? "border-[#E2136E] bg-[#E2136E]/5" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <img 
                    src="https://seeklogo.com/images/B/bkash-logo-FBB258B90F-seeklogo.com.png" 
                    alt="bKash" 
                    className="h-10 object-contain mb-2" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} 
                  />
                  <div className="hidden w-10 h-10 bg-[#E2136E] rounded-full flex items-center justify-center mb-2 text-white font-bold text-xs">bKash</div>
                  <span className={cn("text-sm font-semibold", method === 'bkash' ? "text-[#E2136E]" : "text-slate-600")}>bKash</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('nagad'); setMessage({ type: '', text: '' }); }}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    method === 'nagad' ? "border-[#ED1C24] bg-[#ED1C24]/5" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <img 
                    src="https://seeklogo.com/images/N/nagad-logo-7A70CCFEE0-seeklogo.com.png" 
                    alt="Nagad" 
                    className="h-10 object-contain mb-2" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} 
                  />
                  <div className="hidden w-10 h-10 bg-[#ED1C24] rounded-full flex items-center justify-center mb-2 text-white font-bold text-xs">Nagad</div>
                  <span className={cn("text-sm font-semibold", method === 'nagad' ? "text-[#ED1C24]" : "text-slate-600")}>Nagad</span>
                </button>
              </div>

              {message.text && (
                <div className={cn(
                  "p-4 rounded-xl mb-6 text-sm font-medium",
                  message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                )}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleAdd} className="space-y-6">
                {(method === 'bkash' || method === 'nagad') && (
                  <div className={cn(
                    "p-5 rounded-xl border",
                    method === 'bkash' ? "bg-[#E2136E]/5 border-[#E2136E]/20" : "bg-[#ED1C24]/5 border-[#ED1C24]/20"
                  )}>
                    <h3 className={cn("font-semibold mb-3", method === 'bkash' ? "text-[#E2136E]" : "text-[#ED1C24]")}>
                      Payment Instructions
                    </h3>
                    <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2.5">
                      <li>Go to your {method === 'bkash' ? 'bKash' : 'Nagad'} app.</li>
                      <li>Select <strong>Send Money</strong>.</li>
                      <li className="leading-loose">
                        Enter the personal number: 
                        <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1 ml-1 shadow-sm align-middle">
                          <strong className="text-slate-900 text-base tracking-wide mr-2">01953800351</strong>
                          <button 
                            type="button" 
                            onClick={handleCopy}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-50"
                            title="Copy number"
                          >
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </li>
                      <li>Enter the exact amount: <strong className="text-slate-900 text-base">{selectedCurrency.symbol}{inputAmount}</strong></li>
                      <li>Copy the <strong>Transaction ID (TrxID)</strong> and paste it below.</li>
                    </ol>
                  </div>
                )}

                {(method === 'bkash' || method === 'nagad') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Transaction ID</label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Hash size={18} className={cn(trxError ? "text-red-500" : isTrxValid ? "text-emerald-500" : "text-slate-400")} />
                      </div>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 8N7A6B5C4D"
                        className={cn(
                          "w-full rounded-xl border pl-10 pr-10 py-3 bg-white text-slate-900 focus:ring-2 outline-none transition-shadow uppercase",
                          trxError 
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/30" 
                            : isTrxValid
                              ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/30"
                              : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                        )}
                        value={trxId}
                        onChange={(e) => {
                          setTrxId(e.target.value);
                          if (trxError) setTrxError('');
                        }}
                        onBlur={() => {
                          if (trxId && !trxRegex.test(trxId)) {
                            setTrxError('Transaction ID must be 8-15 alphanumeric characters');
                          }
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {trxError ? (
                          <AlertCircle size={18} className="text-red-500" />
                        ) : isTrxValid ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : null}
                      </div>
                    </div>
                    {trxError && (
                      <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                        <AlertCircle size={12} /> {trxError}
                      </p>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || ((method === 'bkash' || method === 'nagad') && !trxId)}
                  className={cn(
                    "w-full text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    method === 'bkash' ? "bg-[#E2136E] hover:bg-[#c40e5d]" : 
                    method === 'nagad' ? "bg-[#ED1C24] hover:bg-[#cc161d]" : 
                    "bg-slate-900 hover:bg-slate-800"
                  )}
                >
                  {loading ? 'Processing...' : method === 'card' ? `Pay ${selectedCurrency.symbol}${inputAmount} with Fake Card` : 'Verify Payment'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>
          <p className="text-sm text-slate-500 mt-1">Recent funds added to your account.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((trx, idx) => (
            <div key={`${trx.id}-${idx}`} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  trx.status === 'Approved' ? "bg-emerald-100 text-emerald-600" :
                  trx.status === 'Pending' ? "bg-amber-100 text-amber-600" :
                  "bg-red-100 text-red-600"
                )}>
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Fund Request
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-2">
                    <span>{new Date(trx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="font-mono">REQ-{trx.id}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">+${trx.amount.toFixed(2)}</p>
                <div className="flex items-center justify-end mt-1">
                  {trx.status === 'Approved' && <CheckCircle2 size={14} className="text-emerald-500 mr-1" />}
                  {trx.status === 'Pending' && <Clock size={14} className="text-amber-500 mr-1" />}
                  {trx.status === 'Rejected' && <XCircle size={14} className="text-red-500 mr-1" />}
                  <span className={cn(
                    "text-xs font-medium",
                    trx.status === 'Approved' ? "text-emerald-600" :
                    trx.status === 'Pending' ? "text-amber-600" :
                    "text-red-600"
                  )}>
                    {trx.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export const apiFetch = async (resource: string | Request | URL, config: RequestInit = {}, customToken?: string) => {
  const token = customToken || localStorage.getItem('userToken');
  const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : resource.toString());

  const isAuthRoute = url.includes('/api/auth/') || url.includes('/api/admin/login');
  
  if (token && url.includes('/api/') && !isAuthRoute) {
    const headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(resource, { ...config, headers });
  }
  return fetch(resource, config);
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userToken'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchUser = () => {
    supabaseService.getCurrentUser()
      .then(data => {
        if (!data) throw new Error('Not authenticated');
        setUser(data);
        setIsAdmin(data.role === 'admin');
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('userToken');
      });
  };

  const handleLogin = (token: string, username: string) => {
    localStorage.setItem('userToken', token);
    setIsAuthenticated(true);
    fetchUser();
  };

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/*" element={
          !isAuthenticated ? (
            <LandingPage onLogin={handleLogin} />
          ) : (
            <>
              <div className="flex h-screen bg-slate-50 font-sans">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isAdmin={isAdmin} />
                
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <Header setIsOpen={setSidebarOpen} user={user} onLogout={() => { 
                    setIsAuthenticated(false); 
                    localStorage.removeItem('userToken');
                    setUser(null);
                    setIsAdmin(false);
                  }} />
                  
                  <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Routes>
                      <Route path="/" element={<NewOrder user={user} fetchUser={fetchUser} />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/orders" element={<Orders user={user} />} />
                      <Route path="/add-funds" element={<AddFunds user={user} fetchUser={fetchUser} />} />
                      <Route path="/tickets" element={<Tickets user={user} />} />
                      {isAdmin && <Route path="/admin" element={<AdminDashboard user={user} onLogout={() => setIsAdmin(false)} />} />}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
              <AIChatBot />
            </>
          )
        } />
      </Routes>
    </Router>
  );
}
