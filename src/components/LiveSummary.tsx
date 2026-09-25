import React from 'react';
import { MasterCalculationResult, PricingSettings, RoundingOption, MarkupType, PaxDetails } from '../types';
import { formatINR, formatPercentage, parsePositiveNumber } from '../utils/formatters';
import { 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Printer, 
  Users, 
  ChevronRight 
} from 'lucide-react';

interface LiveSummaryProps {
  calculation: MasterCalculationResult;
  pricingSettings: PricingSettings;
  pax: PaxDetails;
  onUpdatePricing: (settings: PricingSettings) => void;
  onOpenBreakdownModal: () => void;
  onOpenAuditModal: () => void;
  onPrint: () => void;
}

export const LiveSummary: React.FC<LiveSummaryProps> = ({
  calculation,
  pricingSettings,
  pax,
  onUpdatePricing,
  onOpenBreakdownModal,
  onOpenAuditModal,
  onPrint,
}) => {
  const {
    categoryTotals,
    totalNetCost,
    totalPax,
    adultEquivalent,
    adultCost,
    childCost,
    infantCost,
    averageCostPerPax,
    sellingPrice,
    profit,
    markupPercentage,
    marginPercentage,
    adultSellingPrice,
    childSellingPrice,
  } = calculation;

  const updateMarkupType = (type: MarkupType) => {
    onUpdatePricing({
      ...pricingSettings,
      markupType: type,
      markupValue: type === 'percentage' ? (pricingSettings.markupValue || 15) : (profit || 10000),
    });
  };

  const updateMarkupValue = (val: number) => {
    onUpdatePricing({
      ...pricingSettings,
      markupValue: val,
    });
  };

  const updateRounding = (rounding: RoundingOption) => {
    onUpdatePricing({
      ...pricingSettings,
      rounding,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col text-xs">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3 py-1.5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-[11px] shadow-xs">
            ₹
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-brand flex items-center gap-1.5 leading-none">
              <span>Live Quotation Summary</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
          </div>
        </div>

        {/* Pax Pill */}
        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-[11px] font-extrabold text-slate-200">
          <Users className="w-3 h-3 text-blue-400" />
          <span>{totalPax} Pax</span>
        </div>
      </div>

      <div className="p-2.5 space-y-2 overflow-y-auto custom-scrollbar">
        
        {/* Category Net Subtotals Mini-list */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase font-extrabold text-slate-500 mb-1">
            <span>Supplier Subtotals</span>
            <button
              onClick={onOpenBreakdownModal}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 lowercase font-bold cursor-pointer transition hover:underline text-[10px]"
            >
              <span>breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-600 text-[11px]">
            <div className="flex justify-between">
              <span>Hotels:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.hotels)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicles:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.vehicles)}</span>
            </div>
            <div className="flex justify-between">
              <span>Meals:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.meals)}</span>
            </div>
            <div className="flex justify-between">
              <span>Activities:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.activities)}</span>
            </div>
            <div className="flex justify-between">
              <span>Flight/Train:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.flightTrainFares)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.otherServices)}</span>
            </div>
          </div>
        </div>

        {/* 1. TOTAL NET PACKAGE COST */}
        <div className="p-2.5 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg text-white shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Total Net Cost
            </span>
            <span className="text-[10px] text-blue-200/90 font-medium">
              Equiv: <strong>{adultEquivalent.toFixed(2)}</strong> • Avg: <strong>{formatINR(averageCostPerPax)}</strong>
            </span>
          </div>
          <div className="text-xl font-black font-brand tracking-tight mt-0.5">
            {formatINR(totalNetCost)}
          </div>
        </div>

        {/* 2. NET COST PER PAX */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[9px] font-bold uppercase text-slate-500">Net Adult</div>
            <div className="text-xs font-black text-slate-900 font-brand">{formatINR(adultCost)}</div>
          </div>

          <div className="p-1.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            <div className="text-[9px] font-bold uppercase text-amber-800">Net Child</div>
            <div className="text-xs font-black text-amber-950 font-brand">{formatINR(childCost)}</div>
          </div>

          <div className="p-1.5 bg-pink-50/60 border border-pink-200 rounded-lg">
            <div className="text-[9px] font-bold uppercase text-pink-800">Net Infant</div>
            <div className="text-xs font-black text-pink-950 font-brand">{formatINR(infantCost)}</div>
          </div>
        </div>

        {/* 3. PRICING & MARKUP CONTROLS */}
        <div className="p-2 bg-slate-100/90 rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              Markup & Profit
            </span>

            {/* Type Toggle */}
            <div className="flex items-center bg-white p-0.5 rounded border border-slate-300 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => updateMarkupType('percentage')}
                className={`px-1.5 py-0.2 rounded transition cursor-pointer ${
                  pricingSettings.markupType === 'percentage'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => updateMarkupType('fixed')}
                className={`px-1.5 py-0.2 rounded transition cursor-pointer ${
                  pricingSettings.markupType === 'fixed'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₹
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                {pricingSettings.markupType === 'percentage' ? 'Markup %' : 'Markup ₹'}
              </label>
              <div className="relative">
                <span className="absolute left-1.5 top-1 text-[11px] font-bold text-slate-400">
                  {pricingSettings.markupType === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={pricingSettings.markupValue || ''}
                  onChange={(e) => updateMarkupValue(parsePositiveNumber(e.target.value, 0))}
                  className="w-full bg-white border border-slate-300 rounded px-1.5 pl-5 py-1 text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-700 mb-0.5">Rounding</label>
              <select
                value={pricingSettings.rounding}
                onChange={(e) => updateRounding(e.target.value as RoundingOption)}
                className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="none">No Rounding</option>
                <option value="100">₹100</option>
                <option value="500">₹500</option>
                <option value="1000">₹1,000</option>
                <option value="5000">₹5,000</option>
              </select>
            </div>
          </div>

          {/* Profit & Margin Metrics Badge */}
          <div className="p-1.5 bg-white rounded border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-800 mr-1.5">Profit:</span>
              <span className="text-sm font-black text-emerald-600 font-brand">+{formatINR(profit)}</span>
            </div>
            <div className="text-[10px] text-slate-600 font-bold flex gap-2">
              <span>Markup: <strong className="text-blue-600">{formatPercentage(markupPercentage)}</strong></span>
              <span>Margin: <strong className="text-emerald-600">{formatPercentage(marginPercentage)}</strong></span>
            </div>
          </div>
        </div>

        {/* 4. FINAL SELLING PRICE (Sunset Gold Hero Card) */}
        <div className="p-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-lg text-white shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-100">
              Selling Price (Client Quotation)
            </span>
            <span className="text-[9px] font-extrabold bg-orange-700/80 px-1.5 py-0.2 rounded border border-orange-300/30">
              Final Total
            </span>
          </div>
          <div className="text-2xl font-black font-brand tracking-tight mt-0.5">
            {formatINR(sellingPrice)}
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-orange-400/40 grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-orange-700/40 p-1.5 rounded border border-orange-400/30">
              <div className="text-[9px] text-orange-200 font-bold uppercase">Per Adult</div>
              <div className="text-xs font-black text-white font-brand">{formatINR(adultSellingPrice)}</div>
            </div>
            {pax.children > 0 && (
              <div className="bg-orange-700/40 p-1.5 rounded border border-orange-400/30">
                <div className="text-[9px] text-orange-200 font-bold uppercase">Per Child</div>
                <div className="text-xs font-black text-white font-brand">{formatINR(childSellingPrice)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onOpenBreakdownModal}
            className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition cursor-pointer text-xs active:scale-95"
          >
            <BarChart3 className="w-3 h-3 text-blue-600" />
            <span>Breakdown</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuditModal}
            className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition cursor-pointer text-xs active:scale-95"
          >
            <FileText className="w-3 h-3 text-indigo-600" />
            <span>Formulas</span>
          </button>
        </div>

        {/* Print / Save PDF Quotation Button */}
        <button
          type="button"
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg font-black shadow transition cursor-pointer text-xs active:scale-95 ring-1 ring-white/10"
        >
          <Printer className="w-3.5 h-3.5 text-orange-400" />
          <span>Print Quotation (Ctrl+P)</span>
        </button>

      </div>
    </div>
  );
};
