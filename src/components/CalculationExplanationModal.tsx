import React from 'react';
import { PackageData, MasterCalculationResult } from '../types';
import { calculateHotelItemCost, calculateVehicleItemCost, calculateMealItemCost, calculateActivityItemCost, calculateFlightTrainFareItemCost, calculateOtherServiceItemCost } from '../engine/calculator';
import { formatINR, formatPercentage } from '../utils/formatters';
import { X, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

interface CalculationExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageData;
  calculation: MasterCalculationResult;
}

export const CalculationExplanationModal: React.FC<CalculationExplanationModalProps> = ({
  isOpen,
  onClose,
  packageData,
  calculation,
}) => {
  if (!isOpen) return null;

  const { pax, hotels, vehicles, meals, activities, flightTrainFares, otherServices, pricingSettings, roomAllocation } = packageData;
  const {
    categoryTotals,
    totalNetCost,
    adultEquivalent,
    adultCost,
    childCost,
    infantCost,
    sellingPrice,
    profit,
    markupPercentage,
    marginPercentage,
    adultSellingPrice,
    childSellingPrice,
  } = calculation;

  const allocation = roomAllocation || { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-brand tracking-wide">
                Transparent Formula & Costing Audit
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step mathematical breakdown for internal quotation verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Step 1: Pax & Equivalents */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-slate-800 text-xs">
                Step 1: Passenger Equivalent Units
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">
                Formula: Adults + (Children × Child%) + (Infants × Infant%)
              </span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-slate-800 space-y-1">
              <div>Adults: {pax.adults} × 1.0 = {pax.adults} Units</div>
              <div>Children: {pax.children} × {pax.childPercentage}% = {(pax.children * (pax.childPercentage/100)).toFixed(2)} Units</div>
              <div>Infants: {pax.infants} × {pax.infantPercentage}% = {(pax.infants * (pax.infantPercentage/100)).toFixed(2)} Units</div>
              <div className="pt-1.5 border-t border-slate-200 font-bold text-blue-700">
                Total Adult Equivalent: {adultEquivalent.toFixed(2)} Units (from {pax.adults + pax.children + pax.infants} total pax)
              </div>
            </div>
          </div>

          {/* Step 2: Combined Hotel Room Allocation & Costing */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-slate-800 text-xs">
                Step 2: Hotels (Combined Tour Allocation: {allocation.doubleRooms}D + {allocation.tripleRooms}T + {allocation.quadRooms}Q)
              </span>
              <span className="font-bold text-blue-700">
                Total: {formatINR(categoryTotals.hotels)}
              </span>
            </div>

            {hotels.length === 0 ? (
              <p className="text-slate-400 italic">No hotels added</p>
            ) : (
              <div className="space-y-2">
                {hotels.map((h, i) => {
                  const c = calculateHotelItemCost(h, allocation);
                  return (
                    <div key={h.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 font-mono">
                      <div className="font-bold text-slate-900 font-sans">
                        #{i + 1} {h.destination || 'City'}: {h.hotelName || 'Hotel'} ({h.nights} Nights, {h.mealPlan})
                      </div>
                      <div className="text-slate-600">
                        • Double: {allocation.doubleRooms} × ₹{h.doubleRate || 0} × {h.nights}N = {formatINR(c.doubleTotal)}
                      </div>
                      <div className="text-blue-900">
                        • Triple: {allocation.tripleRooms} × ₹{c.tripleRate} (₹{h.doubleRate || 0} + ₹{h.extraBedRate || 0}) × {h.nights}N = {formatINR(c.tripleTotal)}
                      </div>
                      <div className="text-indigo-900">
                        • Quad: {allocation.quadRooms} × ₹{c.quadRate} (₹{h.doubleRate || 0} + 2×₹{h.extraBedRate || 0}) × {h.nights}N = {formatINR(c.quadTotal)}
                      </div>
                      <div className="pt-1 border-t border-slate-100 font-bold text-slate-800 text-right">
                        Hotel Subtotal: {formatINR(c.totalCost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Vehicles & Transport */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-slate-800 text-xs">
                Step 3: Transport & Vehicles
              </span>
              <span className="font-bold text-blue-700">
                Total: {formatINR(categoryTotals.vehicles)}
              </span>
            </div>
            {vehicles.length === 0 ? (
              <p className="text-slate-400 italic">No vehicles added</p>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono space-y-1">
                {vehicles.map((v) => (
                  <div key={v.id} className="flex justify-between">
                    <span>{v.numberOfVehicles}x {v.vehicleType} ({v.costingBasis === 'per_day' ? `${v.numberOfDays} Days @ ₹${v.ratePerDay}` : `₹${v.ratePerDay} ${v.costingBasis}`})</span>
                    <strong>{formatINR(calculateVehicleItemCost(v))}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Flight & Train Fares */}
          {flightTrainFares && flightTrainFares.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-slate-800 text-xs">
                  Step 4: Flight & Train Fares (Per Person)
                </span>
                <span className="font-bold text-sky-700">
                  Total: {formatINR(categoryTotals.flightTrainFares)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono space-y-1">
                {flightTrainFares.map((f) => (
                  <div key={f.id} className="flex justify-between">
                    <span>{f.transportType} ({f.sector}): {f.adultQuantity}A @ ₹{f.adultRate} + {f.childQuantity}C + {f.infantQuantity}I</span>
                    <strong>{formatINR(calculateFlightTrainFareItemCost(f, pax.childPercentage))}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Total Supplier Net Cost */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1">
            <div className="flex justify-between items-center text-sm font-extrabold text-blue-950 font-brand">
              <span>TOTAL SUPPLIER NET PACKAGE COST:</span>
              <span>{formatINR(totalNetCost)}</span>
            </div>
            <div className="text-[11px] text-blue-800">
              Hotels ({formatINR(categoryTotals.hotels)}) + Vehicles ({formatINR(categoryTotals.vehicles)}) + Meals ({formatINR(categoryTotals.meals)}) + Activities ({formatINR(categoryTotals.activities)}) + Flight/Train ({formatINR(categoryTotals.flightTrainFares)}) + Other ({formatINR(categoryTotals.otherServices)})
            </div>
          </div>

          {/* Step 6: Markup, Profit & Selling Price */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-extrabold uppercase text-slate-800 text-xs">
              Step 6: Commercial Markup & Client Selling Price
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Net Adult Cost: {formatINR(totalNetCost)} ÷ {adultEquivalent.toFixed(2)} Units</span>
                <strong>= {formatINR(adultCost)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Net Child Cost: {formatINR(adultCost)} × {pax.childPercentage}%</span>
                <strong>= {formatINR(childCost)}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 text-emerald-700">
                <span>Applied Markup ({pricingSettings.markupValue}{pricingSettings.markupType === 'percentage' ? '%' : ' ₹'}):</span>
                <strong>+{formatINR(profit)} ({formatPercentage(markupPercentage)} Markup, {formatPercentage(marginPercentage)} Margin)</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900 text-sm">
                <span>Final Client Selling Price:</span>
                <span className="text-orange-600">{formatINR(sellingPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-700">
                <span>Per Adult Selling Price: {formatINR(sellingPrice)} ÷ {adultEquivalent.toFixed(2)}</span>
                <strong className="text-blue-700">{formatINR(adultSellingPrice)}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified MastiTrips Costing Engine Math
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
