import React from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { Sun, Moon } from 'lucide-react';

interface Props {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<Props> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Dark and Light view"
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 border ${
        theme === 'dark'
          ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-slate-700 shadow-sm'
          : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-600 border-slate-200 hover:border-emerald-200 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 group-hover:text-emerald-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
