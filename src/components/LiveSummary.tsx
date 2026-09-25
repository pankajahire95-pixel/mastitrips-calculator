import React from 'react';
import { MasterCalculationResult, PricingSettings, RoundingOption, MarkupType, PaxDetails } from '../types';
import { formatINR, formatPercentage, parsePositiveNumber } from '../utils/formatters';
import { 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Printer, 
  Users,
  ChevronRight,
  ShieldCheck,
  Percent,
  Sparkles
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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-5.5rem)] transition-all text-xs">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-3 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md ring-2 ring-blue-400/30">
            ₹
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 font-brand flex items-center gap-1.5 leading-none">
              <span>Live Costing Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Instant P&L • Domestic Quotation
            </div>
          </div>
        </div>

        {/* Pax Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/90 rounded-lg border border-slate-700 text-xs font-extrabold text-slate-200 shadow-inner">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>{totalPax} Pax</span>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
        
        {/* Category Net Subtotals Mini-list */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 space-y-2 text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
            <span>Supplier Net Subtotals</span>
            <button
              onClick={onOpenBreakdownModal}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 lowercase font-bold cursor-pointer transition hover:underline"
            >
              <span>view breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-600 font-medium">
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
              <span>Flight / Train:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.flightTrainFares)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Services:</span>
              <span className="font-extrabold text-slate-900">{formatINR(categoryTotals.otherServices)}</span>
            </div>
          </div>
        </div>

        {/* 1. TOTAL NET PACKAGE COST (Glowing Blue Card) */}
        <div className="p-4 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-xl text-white shadow-lg relative overflow-hidden ring-1 ring-blue-400/30">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Total Package Net Cost
              </span>
              <span className="px-2 py-0.5 bg-blue-600/60 rounded-md text-[10px] font-bold text-blue-100 border border-blue-400/30">
                Supplier Net
              </span>
            </div>
            <div className="text-3xl font-black font-brand tracking-tight">
              {formatINR(totalNetCost)}
            </div>
            <div className="mt-2 pt-2 border-t border-blue-500/40 flex items-center justify-between text-[11px] text-blue-200/90 font-medium">
              <span>Adult Equiv: <strong>{adultEquivalent.toFixed(2)} Units</strong></span>
              <span>Avg/Pax: <strong>{formatINR(averageCostPerPax)}</strong></span>
            </div>
          </div>
        </div>

        {/* 2. NET COST PER PAX (3-Column Grid) */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition">
            <div className="text-[10px] font-bold uppercase text-slate-500">Net Adult</div>
            <div className="text-sm font-black text-slate-900 font-brand mt-0.5">{formatINR(adultCost)}</div>
            <div className="text-[9px] text-slate-400 font-medium mt-0.5">100% Share</div>
          </div>

          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl hover:border-amber-300 transition">
            <div className="text-[10px] font-bold uppercase text-amber-800">Net Child</div>
            <div className="text-sm font-black text-amber-950 font-brand mt-0.5">{formatINR(childCost)}</div>
            <div className="text-[9px] text-amber-700 font-medium mt-0.5">{pax.childPercentage}% Rule</div>
          </div>

          <div className="p-2.5 bg-pink-50/60 border border-pink-200 rounded-xl hover:border-pink-300 transition">
            <div className="text-[10px] font-bold uppercase text-pink-800">Net Infant</div>
            <div className="text-sm font-black text-pink-950 font-brand mt-0.5">{formatINR(infantCost)}</div>
            <div className="text-[9px] text-pink-700 font-medium mt-0.5">{pax.infantPercentage}% Share</div>
          </div>
        </div>

        {/* 3. PRICING & MARKUP CONTROLS */}
        <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Markup & Profit Margin
            </span>

            {/* Type Toggle */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-300 text-[10px] font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => updateMarkupType('percentage')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  pricingSettings.markupType === 'percentage'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                % Percent
              </button>
              <button
                type="button"
                onClick={() => updateMarkupType('fixed')}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  pricingSettings.markupType === 'fixed'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₹ Fixed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                {pricingSettings.markupType === 'percentage' ? 'Markup Percentage (%)' : 'Fixed Markup Amount (₹)'}
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">
                  {pricingSettings.markupType === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={pricingSettings.markupValue || ''}
                  onChange={(e) => updateMarkupValue(parsePositiveNumber(e.target.value, 0))}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Selling Rounding</label>
              <select
                value={pricingSettings.rounding}
                onChange={(e) => updateRounding(e.target.value as RoundingOption)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Rounding</option>
                <option value="100">Nearest ₹100</option>
                <option value="500">Nearest ₹500</option>
                <option value="1000">Nearest ₹1,000</option>
                <option value="5000">Nearest ₹5,000</option>
              </select>
            </div>
          </div>

          {/* Profit & Margin Metrics Badge */}
          <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-800">Gross Profit</div>
              <div className="text-base font-black text-emerald-600 font-brand">
                +{formatINR(profit)}
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="text-xs font-bold text-slate-700">
                Markup: <span className="text-blue-600 font-extrabold">{formatPercentage(markupPercentage)}</span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                Margin: <span className="text-emerald-600 font-extrabold">{formatPercentage(marginPercentage)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FINAL SELLING PRICE (Sunset Gold Hero Card) */}
        <div className="p-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl text-white shadow-xl relative overflow-hidden ring-1 ring-orange-400/40">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-100">
                Final Selling Price (Total Package)
              </span>
              <span className="px-2 py-0.5 bg-orange-700/80 rounded-md text-[10px] font-extrabold text-white border border-orange-300/30">
                Client Quotation
              </span>
            </div>
            <div className="text-3xl font-black font-brand tracking-tight">
              {formatINR(sellingPrice)}
            </div>

            <div className="mt-2.5 pt-2 border-t border-orange-400/50 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-700/40 p-2 rounded-lg border border-orange-400/30">
                <div className="text-[10px] text-orange-200 font-bold uppercase">Per Adult Selling</div>
                <div className="text-sm font-black text-white font-brand mt-0.5">{formatINR(adultSellingPrice)}</div>
              </div>
              {pax.children > 0 && (
                <div className="bg-orange-700/40 p-2 rounded-lg border border-orange-400/30">
                  <div className="text-[10px] text-orange-200 font-bold uppercase">Per Child Selling</div>
                  <div className="text-sm font-black text-white font-brand mt-0.5">{formatINR(childSellingPrice)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenBreakdownModal}
            className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-extrabold transition cursor-pointer shadow-2xs active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Cost Breakdown</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuditModal}
            className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-extrabold transition cursor-pointer shadow-2xs active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit Formulas</span>
          </button>
        </div>

        {/* Print / Save PDF Quotation Button */}
        <button
          type="button"
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black shadow-lg hover:shadow-xl transition cursor-pointer text-xs active:scale-95 ring-1 ring-white/10"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          <span>Print / Save PDF Quotation (Ctrl+P)</span>
        </button>

      </div>
    </div>
  );
};
