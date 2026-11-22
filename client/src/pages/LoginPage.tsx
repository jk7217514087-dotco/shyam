import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Recycle, Shield, Truck, Users, Lock, Mail, User, Phone, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, quickLoginAsDemo, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'worker') navigate('/worker');
      else navigate('/citizen');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !password) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        const res = await register({ name, email, password, phone });
        if (res.success) {
          navigate('/citizen');
        } else {
          setError(res.message || 'Registration failed.');
        }
      } else {
        if (!email || !password) {
          setError('Please provide both email and password.');
          setLoading(false);
          return;
        }
        const res = await login({ email, password });
        if (res.success) {
          // Navigation handled by auth effect or redirect
          const from = (location.state as any)?.from?.pathname;
          if (from) navigate(from);
        } else {
          setError(res.message || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, redirect: string) => {
    setError(null);
    setLoading(true);
    const success = await quickLoginAsDemo(demoEmail, demoPass);
    setLoading(false);
    if (success) {
      navigate(redirect);
    } else {
      setError('Quick login failed. Ensure the server is running.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4">
            <Recycle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Join SmartBin AI' : 'Sign in to SmartBin AI'}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            {isRegister
              ? 'Empowering citizens with AI-assisted municipal reporting'
              : 'Secure role-based access for citizens, workers, and administration'}
          </p>
        </div>

        {/* Hackathon Demo Quick Login Box */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Persona Sign In
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">
              Hackathon Ready
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@smartbin.ai', 'Admin@123', '/admin')}
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-center transition flex flex-col items-center gap-1 group"
            >
              <Shield className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-purple-300">Admin</span>
              <span className="text-[9px] text-slate-400">Commissioner</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('worker.rajesh@smartbin.ai', 'Worker@123', '/worker')}
              className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-center transition flex flex-col items-center gap-1 group"
            >
              <Truck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-cyan-300">Worker</span>
              <span className="text-[9px] text-slate-400">Rajesh K.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('citizen.ananya@gmail.com', 'Citizen@123', '/citizen')}
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-center transition flex flex-col items-center gap-1 group"
            >
              <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-emerald-300">Citizen</span>
              <span className="text-[9px] text-slate-400">Ananya D.</span>
            </button>
          </div>
        </div>

        {/* Main Form Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                !isRegister ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                isRegister ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Citizen
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Deshmukh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartbin.ai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 11223"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Citizen Account' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
