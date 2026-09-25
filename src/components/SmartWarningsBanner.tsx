import React, { useState } from 'react';
import { SmartWarning } from '../types';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface SmartWarningsBannerProps {
  warnings: SmartWarning[];
}

export const SmartWarningsBanner: React.FC<SmartWarningsBannerProps> = ({ warnings }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!warnings || warnings.length === 0) {
    return null;
  }

  const criticalCount = warnings.filter((w) => w.level === 'warning').length;

  return (
    <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 shadow-2xs overflow-hidden transition">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 flex items-center justify-between cursor-pointer select-none hover:bg-amber-100/60 transition"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold font-brand">
            {criticalCount > 0 ? `${criticalCount} Configuration Notice${criticalCount > 1 ? 's' : ''}` : 'Package Guidance'}
          </span>
          <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
            — {warnings[0].title}: {warnings[0].message}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full">{warnings.length} items</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-3.5 pb-2.5 pt-1 border-t border-amber-200/60 space-y-1.5 text-xs animate-in fade-in">
          {warnings.map((w) => (
            <div key={w.id} className="flex items-start gap-1.5 text-[11px] text-amber-800">
              <span className="font-bold">• {w.title}:</span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
