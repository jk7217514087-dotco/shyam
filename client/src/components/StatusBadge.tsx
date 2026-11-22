import React from 'react';
import { ComplaintStatus } from '../types/index.js';
import { Clock, CheckCircle2, AlertCircle, Sparkles, UserCheck, Play } from 'lucide-react';

interface Props {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Submitted':
        return {
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
          icon: Clock,
          label: 'Submitted',
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: Clock,
          label: 'Under Review',
        };
      case 'Assigned':
        return {
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
          icon: UserCheck,
          label: 'Worker Assigned',
        };
      case 'In Progress':
        return {
          bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400 animate-pulse',
          icon: Play,
          label: 'In Progress',
        };
      case 'Cleaned_Pending_Verification':
        return {
          bg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
          dot: 'bg-amber-300 animate-ping',
          icon: Sparkles,
          label: 'Awaiting Admin Verification',
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          label: 'Resolved & Cleaned',
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: AlertCircle,
          label: 'Re-cleaning Required',
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          icon: Clock,
          label: status,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
