import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Recycle,
  PlusCircle,
  Search,
  LayoutDashboard,
  Shield,
  Truck,
  LogOut,
  User,
  Sparkles,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.js';


export const Navbar: React.FC = () => {
  const { user, logout, quickLoginAsDemo } = React.useContext(
    React.createContext<any>(null)
  ) || useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleDemoSwitch = async (email: string, pass: string, targetPath: string) => {
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    await quickLoginAsDemo(email, pass);
    navigate(targetPath);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'worker') return '/worker';
    return '/citizen';
  };

  const getRoleIcon = () => {
    if (user?.role === 'admin') return <Shield className="w-4 h-4 text-purple-400" />;
    if (user?.role === 'worker') return <Truck className="w-4 h-4 text-cyan-400" />;
    return <User className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 text-slate-950 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white smartbin-brand-title">
                SmartBin <span className="text-emerald-500 font-black">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider hidden sm:block font-medium">
                MUNICIPAL SOLID WASTE INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-slate-800">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                location.pathname === '/' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home
            </Link>
            <Link
              to="/report"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                location.pathname === '/report' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Report Garbage
            </Link>
            <Link
              to="/track"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                location.pathname.startsWith('/track') ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Track Complaint
            </Link>
            {user && (
              <Link
                to={getDashboardPath()}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  ['/citizen', '/worker', '/admin'].includes(location.pathname)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {user.role === 'admin' ? 'Admin Console' : user.role === 'worker' ? 'Worker Tasks' : 'My Dashboard'}
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    One-Click Hackathon Login
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('admin@smartbin.ai', 'Admin@123', '/admin')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 group transition"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="font-semibold text-slate-100">Administrator</p>
                        <p className="text-[10px] text-slate-400">Commissioner Vikram</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-400 font-mono">/admin</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('worker.rajesh@smartbin.ai', 'Worker@123', '/worker')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 group transition"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="font-semibold text-slate-100">Sanitation Worker</p>
                        <p className="text-[10px] text-slate-400">Rajesh Kumar</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">/worker</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('citizen.ananya@gmail.com', 'Citizen@123', '/citizen')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 group transition"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-slate-100">Active Citizen</p>
                        <p className="text-[10px] text-slate-400">Ananya Deshmukh</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">/citizen</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                    {getRoleIcon()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-lg hover:border-rose-500/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger & theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Color Appearance</span>
            <ThemeToggle showLabel={true} />
          </div>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-slate-300 font-medium"
          >
            Home
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-emerald-400 font-bold"
          >
            Report Garbage
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-slate-300 font-medium"
          >
            Track Complaint
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm py-2 text-cyan-400 font-medium"
            >
              Go to Dashboard ({user.role})
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Switcher</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoSwitch('admin@smartbin.ai', 'Admin@123', '/admin')}
                className="px-2 py-2 text-center text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded"
              >
                Admin
              </button>
              <button
                onClick={() => handleDemoSwitch('worker.rajesh@smartbin.ai', 'Worker@123', '/worker')}
                className="px-2 py-2 text-center text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded"
              >
                Worker
              </button>
              <button
                onClick={() => handleDemoSwitch('citizen.ananya@gmail.com', 'Citizen@123', '/citizen')}
                className="px-2 py-2 text-center text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded"
              >
                Citizen
              </button>
            </div>
          </div>

          <div className="pt-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-sm text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm text-slate-950 font-bold bg-emerald-500 rounded-lg"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
