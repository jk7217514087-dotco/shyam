import React from 'react';
import { ITimelineEntry, ComplaintStatus } from '../types/index.js';
import { CheckCircle2, Clock, Play, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  timeline: ITimelineEntry[];
  currentStatus: ComplaintStatus;
}

const STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: 'Reported', desc: 'Complaint registered by citizen with AI scan' },
  { status: 'Assigned', label: 'Dispatched', desc: 'Sanitation worker scheduled & assigned' },
  { status: 'In Progress', label: 'In Progress', desc: 'Field crew on-site clearing waste' },
  { status: 'Cleaned_Pending_Verification', label: 'Cleaned', desc: 'After-cleaning evidence submitted' },
  { status: 'Resolved', label: 'Verified', desc: 'Approved & cleared by municipal administration' },
];

export const TimelineView: React.FC<Props> = ({ timeline, currentStatus }) => {
  const getStatusIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Cleaned_Pending_Verification':
        return 3;
      case 'Resolved':
        return 4;
      case 'Rejected':
        return 2; // Returns to in progress
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'worker':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'citizen':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Horizontal Progress Bar for Key Milestones (Tablet & Desktop) */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 z-0"
            style={{ width: `${(Math.min(currentIndex, 4) / 4) * 100}%` }}
          />
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={step.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold text-center ${
                    isCurrent ? 'text-emerald-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-Friendly Stepper Card (Phones & Small Devices) */}
      <div className="block sm:hidden bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Clearance Stage {Math.min(currentIndex + 1, 5)} of 5
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {STEPS[currentIndex]?.label || 'In Progress'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${((Math.min(currentIndex, 4) + 1) / 5) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-5 gap-1 text-center">
          {STEPS.map((s, idx) => (
            <div key={s.status} className="flex flex-col items-center">
              <span
                className={`w-2 h-2 rounded-full mb-1 ${
                  idx <= currentIndex ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-700'
                }`}
              />
              <span
                className={`text-[9px] truncate max-w-full font-medium ${
                  idx === currentIndex
                    ? 'text-emerald-400 font-bold'
                    : idx < currentIndex
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Vertical Activity Log */}
      <div className="flex flex-col gap-4 mt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Complete Audit Trail & State Transitions
        </h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timeline.map((entry, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950 shadow group-hover:scale-125 transition-transform" />
              <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3.5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">{entry.changedByName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getRoleBadge(entry.role)}`}>
                      {entry.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{entry.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
