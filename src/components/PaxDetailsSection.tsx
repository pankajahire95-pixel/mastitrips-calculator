import React from 'react';
import { PaxDetails } from '../types';
import { Users, UserCheck, Baby, Percent, Shield } from 'lucide-react';
import { parsePositiveNumber } from '../utils/formatters';

interface PaxDetailsSectionProps {
  pax: PaxDetails;
  onChange: (pax: PaxDetails) => void;
}

export const PaxDetailsSection: React.FC<PaxDetailsSectionProps> = ({
  pax,
  onChange,
}) => {
  const updateField = <K extends keyof PaxDetails>(key: K, value: PaxDetails[K]) => {
    onChange({
      ...pax,
      [key]: value,
    });
  };

  const totalPax = (pax.adults || 0) + (pax.children || 0) + (pax.infants || 0);
  const adultEquiv = (pax.adults || 0) + ((pax.children || 0) * ((pax.childPercentage || 70) / 100)) + ((pax.infants || 0) * ((pax.infantPercentage || 0) / 100));

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition hover:shadow-md hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-2xs ring-1 ring-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 font-brand">
              2. Passenger (Pax) Configuration
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Adults, child pricing rules & infant cost allocation breakdown
            </p>
          </div>
        </div>

        {/* Live Adult Equiv & Total Summary Pill */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl text-xs font-bold text-blue-900 shadow-2xs">
            <span>Total: <strong>{totalPax} Pax</strong></span>
            <span className="text-slate-400 font-normal ml-1.5">({pax.adults} Adults + {pax.children} Child + {pax.infants} Infant)</span>
          </div>

          <div className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-xs font-brand tracking-wide">
            <span>{adultEquiv.toFixed(2)} Adult Equiv Units</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Adults Count */}
        <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200/80 hover:border-blue-300 transition shadow-2xs">
          <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Adults (12y+) <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="number"
            min="1"
            value={pax.adults ?? ''}
            onChange={(e) => updateField('adults', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-lg font-black text-center text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[10px] text-blue-700 font-bold text-center mt-1.5">100% Rate Payer</div>
        </div>

        {/* Children Count */}
        <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/80 hover:border-amber-300 transition shadow-2xs">
          <label className="block text-xs font-extrabold text-amber-950 mb-1.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Children (5–11y)</span>
          </label>
          <input
            type="number"
            min="0"
            value={pax.children ?? ''}
            onChange={(e) => updateField('children', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-lg font-black text-center text-amber-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="text-[10px] text-amber-700 font-bold text-center mt-1.5">{pax.childPercentage}% of Adult Rate</div>
        </div>

        {/* Infants Count */}
        <div className="bg-pink-50/40 p-3.5 rounded-xl border border-pink-200/80 hover:border-pink-300 transition shadow-2xs">
          <label className="block text-xs font-extrabold text-pink-950 mb-1.5 flex items-center gap-1.5">
            <Baby className="w-4 h-4 text-pink-600" />
            <span>Infants (&lt;5y)</span>
          </label>
          <input
            type="number"
            min="0"
            value={pax.infants ?? ''}
            onChange={(e) => updateField('infants', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-pink-300 rounded-lg px-3 py-2 text-lg font-black text-center text-pink-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="text-[10px] text-pink-700 font-bold text-center mt-1.5">{pax.infantPercentage}% Share</div>
        </div>

        {/* Child Cost % Fallback */}
        <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs">
          <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-500" />
              <span>Child Cost %</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Std: 70%</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={pax.childPercentage ?? ''}
            onChange={(e) => updateField('childPercentage', parsePositiveNumber(e.target.value, 70))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-lg font-black text-center text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1.5">Fallback % for Child</div>
        </div>

        {/* Infant Cost % */}
        <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs col-span-1 sm:col-span-1">
          <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-500" />
              <span>Infant Cost %</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Std: 0%</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={pax.infantPercentage ?? ''}
            onChange={(e) => updateField('infantPercentage', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-lg font-black text-center text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1.5">Default: 0% Free</div>
        </div>

      </div>
    </section>
  );
};
