import React from 'react';
import { Recycle, Heart, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-auto py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white smartbin-brand-title">
                SmartBin <span className="text-emerald-500 font-black">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              "Report Smartly. Collect Efficiently. Keep Cities Clean."
            </p>
            <p className="text-slate-500 text-[11px]">
              An AI-assisted municipal sanitation lifecycle platform engineered for civic transparency, optimal route collection, and verified clearance.
            </p>
          </div>

          {/* Citizen Links */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Citizen Services</h5>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/report" className="hover:text-emerald-400 transition">Report Garbage Spot</a></li>
              <li><a href="/track" className="hover:text-emerald-400 transition">Track Public Complaint</a></li>
              <li><a href="/citizen" className="hover:text-emerald-400 transition">Citizen Dashboard</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a></li>
            </ul>
          </div>

          {/* Administration & Field Operations */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Municipal Operations</h5>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/worker" className="hover:text-cyan-400 transition">Sanitation Worker Dispatch</a></li>
              <li><a href="/admin" className="hover:text-purple-400 transition">Administrator Console</a></li>
              <li><a href="#hotspots" className="hover:text-cyan-400 transition">Waste Hotspot Heatmaps</a></li>
              <li><a href="#impact" className="hover:text-emerald-400 transition">Carbon & Landfill Impact</a></li>
            </ul>
          </div>

          {/* Tech & Verification */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">AI & Architecture</h5>
            <div className="flex flex-col gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>FastAPI Multi-Spectral Feature Classifier</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Role-Based Municipal Access Control (RBAC)</span>
              </div>
              <p className="text-slate-500 mt-1">
                Built with React 19, TypeScript, Express, Mongoose, Leaflet, and Python AI.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} SmartBin AI Systems. Designed for Municipal Sanitation Excellence.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Clean Urban Spaces
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
