import React from 'react';
import { WasteCategory, PriorityLevel } from '../types/index.js';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface CategoryProps {
  category: WasteCategory;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryProps> = ({ category, showIcon = true }) => {
  const configs: Record<WasteCategory, { label: string; icon: string; style: string }> = {
    plastic: {
      label: 'Plastic & Polymers',
      icon: '🧴',
      style: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
    organic: {
      label: 'Organic Biomass',
      icon: '🍏',
      style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    paper_cardboard: {
      label: 'Paper & Cardboard',
      icon: '📦',
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    metal: {
      label: 'Metal Scrap',
      icon: '🥫',
      style: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
    },
    glass: {
      label: 'Glass Bottles',
      icon: '🍾',
      style: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    },
    electronic: {
      label: 'E-Waste',
      icon: '💻',
      style: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    hazardous: {
      label: 'Hazardous / Medical',
      icon: '☣️',
      style: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
    },
    mixed: {
      label: 'Mixed Refuse',
      icon: '🗑️',
      style: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    },
  };

  const config = configs[category] || configs.mixed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border backdrop-blur-sm ${config.style}`}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

interface PriorityProps {
  priority: PriorityLevel;
}

export const PriorityBadge: React.FC<PriorityProps> = ({ priority }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'Critical':
        return {
          bg: 'bg-red-500/20 text-red-400 border-red-500/40',
          icon: ShieldAlert,
          label: 'Critical Hazard',
        };
      case 'High':
        return {
          bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          icon: AlertTriangle,
          label: 'High Priority',
        };
      case 'Medium':
        return {
          bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
          icon: AlertCircle,
          label: 'Medium Priority',
        };
      case 'Low':
        return {
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          icon: Info,
          label: 'Low Priority',
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
          icon: Info,
          label: priority,
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
