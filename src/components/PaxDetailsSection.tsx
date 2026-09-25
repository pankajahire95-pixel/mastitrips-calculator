import React from 'react';
import { PaxDetails } from '../types';
import { Users, UserCheck, Baby, Percent } from 'lucide-react';
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
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 sm:p-3.5 transition hover:border-slate-300 h-full flex flex-col justify-between">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold ring-1 ring-indigo-100">
            <Users className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-brand">
            2. Pax Configuration
          </h2>
        </div>

        {/* Live Adult Equiv & Total Summary Pill */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md text-[11px] font-bold text-blue-900">
            Total: <strong>{totalPax} Pax</strong>
          </span>
          <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[11px] font-black font-brand">
            {adultEquiv.toFixed(2)} Equiv
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Adults Count */}
        <div className="bg-blue-50/50 p-2 sm:p-2.5 rounded-lg border border-blue-200/80">
          <label className="block text-[11px] font-extrabold text-slate-800 mb-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>Adults (12y+) <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="number"
            min="1"
            value={pax.adults ?? ''}
            onChange={(e) => updateField('adults', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-blue-300 rounded-md px-2 py-1 text-sm font-black text-center text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[9px] text-blue-700 font-bold text-center mt-1">100% Rate</div>
        </div>

        {/* Children Count */}
        <div className="bg-amber-50/50 p-2 sm:p-2.5 rounded-lg border border-amber-200/80">
          <label className="block text-[11px] font-extrabold text-amber-950 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-600" />
            <span>Child (5–11y)</span>
          </label>
          <input
            type="number"
            min="0"
            value={pax.children ?? ''}
            onChange={(e) => updateField('children', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-amber-300 rounded-md px-2 py-1 text-sm font-black text-center text-amber-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="text-[9px] text-amber-700 font-bold text-center mt-1">{pax.childPercentage}% Rate</div>
        </div>

        {/* Infants Count */}
        <div className="bg-pink-50/50 p-2 sm:p-2.5 rounded-lg border border-pink-200/80">
          <label className="block text-[11px] font-extrabold text-pink-950 mb-1 flex items-center gap-1">
            <Baby className="w-3 h-3 text-pink-600" />
            <span>Infants (&lt;5y)</span>
          </label>
          <input
            type="number"
            min="0"
            value={pax.infants ?? ''}
            onChange={(e) => updateField('infants', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-pink-300 rounded-md px-2 py-1 text-sm font-black text-center text-pink-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="text-[9px] text-pink-700 font-bold text-center mt-1">{pax.infantPercentage}% Share</div>
        </div>

        {/* Child Cost % Fallback */}
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-200">
          <label className="block text-[11px] font-extrabold text-slate-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-slate-500" />
              <span>Child %</span>
            </span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={pax.childPercentage ?? ''}
            onChange={(e) => updateField('childPercentage', parsePositiveNumber(e.target.value, 70))}
            className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm font-black text-center text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[9px] text-slate-500 font-medium text-center mt-1">Std: 70%</div>
        </div>

        {/* Infant Cost % */}
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-extrabold text-slate-800 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-slate-500" />
              <span>Infant %</span>
            </span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={pax.infantPercentage ?? ''}
            onChange={(e) => updateField('infantPercentage', parsePositiveNumber(e.target.value, 0))}
            className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm font-black text-center text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-[9px] text-slate-500 font-medium text-center mt-1">Default: 0%</div>
        </div>
      </div>
    </section>
  );
};
