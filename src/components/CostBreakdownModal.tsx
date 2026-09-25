import React from 'react';
import { CategorySummary, MasterCalculationResult } from '../types';
import { formatINR, formatPercentage } from '../utils/formatters';
import { X, PieChart, Building2, Car, Utensils, Compass, Plane, Layers } from 'lucide-react';

interface CostBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: MasterCalculationResult;
}

interface CategoryMeta {
  key: keyof CategorySummary;
  label: string;
  color: string;
  bgColor: string;
  barColor: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryMeta[] = [
  { key: 'hotels', label: 'Hotels & Accommodation', color: 'text-blue-700', bgColor: 'bg-blue-50', barColor: 'bg-blue-600', icon: <Building2 className="w-4 h-4 text-blue-600" /> },
  { key: 'vehicles', label: 'Vehicles & Transport', color: 'text-orange-700', bgColor: 'bg-orange-50', barColor: 'bg-orange-500', icon: <Car className="w-4 h-4 text-orange-500" /> },
  { key: 'meals', label: 'Meals & Catering', color: 'text-emerald-700', bgColor: 'bg-emerald-50', barColor: 'bg-emerald-600', icon: <Utensils className="w-4 h-4 text-emerald-600" /> },
  { key: 'activities', label: 'Activities & Experiences', color: 'text-indigo-700', bgColor: 'bg-indigo-50', barColor: 'bg-indigo-600', icon: <Compass className="w-4 h-4 text-indigo-600" /> },
  { key: 'flightTrainFares', label: 'Flight & Train Fares', color: 'text-sky-700', bgColor: 'bg-sky-50', barColor: 'bg-sky-600', icon: <Plane className="w-4 h-4 text-sky-600" /> },
  { key: 'otherServices', label: 'Other Ancillary Services', color: 'text-pink-700', bgColor: 'bg-pink-50', barColor: 'bg-pink-600', icon: <Layers className="w-4 h-4 text-pink-600" /> },
];

export const CostBreakdownModal: React.FC<CostBreakdownModalProps> = ({
  isOpen,
  onClose,
  calculation,
}) => {
  if (!isOpen) return null;

  const { categoryTotals, totalNetCost } = calculation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-brand">
                Package Cost Distribution & Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Total Net: <strong>{formatINR(totalNetCost)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Segmented Distribution Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
              <span>Cost Share Visualization</span>
              <span>100% of Net Cost</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {CATEGORIES.map((cat) => {
                const amount = categoryTotals[cat.key] || 0;
                const pct = totalNetCost > 0 ? (amount / totalNetCost) * 100 : 0;
                if (pct <= 0) return null;

                return (
                  <div
                    key={cat.key}
                    className={`${cat.barColor} h-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                    title={`${cat.label}: ${formatINR(amount)} (${formatPercentage(pct)})`}
                  />
                );
              })}
            </div>
          </div>

          {/* Detailed Category Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Net Amount</th>
                  <th className="py-2.5 px-4 text-right">Share (%)</th>
                  <th className="py-2.5 px-4 min-w-[120px]">Share Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CATEGORIES.map((cat) => {
                  const amount = categoryTotals[cat.key] || 0;
                  const pct = totalNetCost > 0 ? (amount / totalNetCost) * 100 : 0;

                  return (
                    <tr key={cat.key} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <span className={`p-1 rounded ${cat.bgColor}`}>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 font-brand">
                        {formatINR(amount)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-600">
                        {formatPercentage(pct)}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${cat.barColor}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td className="py-3 px-4 text-slate-800 uppercase text-[11px]">Total Net Package Cost</td>
                  <td className="py-3 px-4 text-right text-sm text-blue-700 font-extrabold font-brand">
                    {formatINR(totalNetCost)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">100.0%</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
