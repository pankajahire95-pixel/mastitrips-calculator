import React from 'react';
import { PackageDetails } from '../types';
import { Compass, Calendar, MapPin, Moon, Sun } from 'lucide-react';
import { parsePositiveNumber } from '../utils/formatters';

interface PackageDetailsSectionProps {
  packageDetails: PackageDetails;
  onChange: (details: PackageDetails) => void;
}

export const PackageDetailsSection: React.FC<PackageDetailsSectionProps> = ({
  packageDetails,
  onChange,
}) => {
  const updateField = <K extends keyof PackageDetails>(key: K, value: PackageDetails[K]) => {
    onChange({
      ...packageDetails,
      [key]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition hover:shadow-md hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs ring-1 ring-blue-100">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 font-brand">
              1. Tour Package Details
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Core package information, destination route, and travel itinerary dates
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        
        {/* Package Name (Spacious 5 columns) */}
        <div className="lg:col-span-5">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tour Package Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Royal Rajasthan Heritage & Desert Tour"
            value={packageDetails.packageName}
            onChange={(e) => updateField('packageName', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        {/* Destination Route (Spacious 3 columns) */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Destination Route <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="text"
            placeholder="e.g. Udaipur - Jodhpur - Jaisalmer"
            value={packageDetails.destination}
            onChange={(e) => updateField('destination', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        {/* Travel Date (Spacious 2 columns) */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Travel Date</span>
          </label>
          <input
            type="date"
            value={packageDetails.travelDate}
            onChange={(e) => updateField('travelDate', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
          />
        </div>

        {/* Duration Days & Nights (Spacious 2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center flex items-center justify-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Days</span>
            </label>
            <input
              type="number"
              min="1"
              value={packageDetails.days || ''}
              onChange={(e) => {
                const d = parsePositiveNumber(e.target.value, 1);
                updateField('days', d);
                if (packageDetails.nights === 0 || packageDetails.nights === packageDetails.days - 1) {
                  updateField('nights', Math.max(0, d - 1));
                }
              }}
              className="w-full bg-slate-50/70 border border-slate-300 rounded-xl py-2.5 text-sm font-black text-center text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center flex items-center justify-center gap-1">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nights</span>
            </label>
            <input
              type="number"
              min="0"
              value={packageDetails.nights ?? ''}
              onChange={(e) => updateField('nights', parsePositiveNumber(e.target.value, 0))}
              className="w-full bg-slate-50/70 border border-slate-300 rounded-xl py-2.5 text-sm font-black text-center text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
