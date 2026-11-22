import React, { useState } from 'react';
import { Columns, Eye } from 'lucide-react';

interface Props {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<Props> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Reported Heap (Before)',
  afterLabel = 'Clearance Evidence (After)',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-emerald-400" /> Visual Verification Evidence
        </span>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'slider' ? 'sideBySide' : 'slider')}
          className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Columns className="w-3 h-3" />
          {viewMode === 'slider' ? 'Side-by-Side Mode' : 'Interactive Split Slider'}
        </button>
      </div>

      {viewMode === 'slider' ? (
        <div className="relative w-full aspect-video md:aspect-[16/9] rounded-xl overflow-hidden select-none border border-slate-700 bg-slate-900 shadow-2xl">
          {/* After image (background layer) */}
          <img
            src={afterUrl}
            alt="After Clearance"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-emerald-500/90 text-slate-950 font-bold text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow backdrop-blur-sm z-10 flex items-center gap-1">
            <span>✨</span> <span className="truncate max-w-[140px] sm:max-w-none">{afterLabel}</span>
          </div>

          {/* Before image (clipped overlay with CSS clip-path for 100% distortion-free responsiveness) */}
          <img
            src={beforeUrl}
            alt="Before Clearance"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          />
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-slate-900/90 text-rose-300 font-bold text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow border border-slate-700 backdrop-blur-sm z-10 flex items-center gap-1">
            <span>⚠️</span> <span className="truncate max-w-[140px] sm:max-w-none">{beforeLabel}</span>
          </div>

          {/* Slider line & touch handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none z-20"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center font-bold text-xs border-2 border-emerald-500 select-none">
              ⟷
            </div>
          </div>

          {/* Transparent interactive range input for touch & mouse */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 w-full h-full cursor-ew-resize z-30 touch-none"
            aria-label="Before and after comparison slider"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-rose-500/30 bg-slate-900">
              <img
                src={beforeUrl}
                alt="Before Clearance"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-rose-500/90 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shadow">
                Before: Reported Waste
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900">
              <img
                src={afterUrl}
                alt="After Clearance"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-emerald-500/90 text-slate-950 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shadow">
                After: Sanitation Clearance
              </span>
            </div>
          </div>
        </div>
      )}
      <p className="text-[11px] text-slate-400 text-center italic">
        Drag slider left/right to contrast reported waste with verified sanitation evidence.
      </p>
    </div>
  );
};
