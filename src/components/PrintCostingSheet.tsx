import React from 'react';
import { PackageData, MasterCalculationResult } from '../types';
import { calculateHotelItemCost, calculateFlightTrainFareItemCost, calculateVehicleItemCost } from '../engine/calculator';
import { formatINR, formatPercentage } from '../utils/formatters';

interface PrintCostingSheetProps {
  packageData: PackageData;
  calculation: MasterCalculationResult;
}

export const PrintCostingSheet: React.FC<PrintCostingSheetProps> = ({
  packageData,
  calculation,
}) => {
  const { packageDetails, pax, roomAllocation, hotels, vehicles, flightTrainFares, otherServices, pricingSettings } = packageData;
  const {
    categoryTotals,
    totalNetCost,
    totalPax,
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
    <div id="printable-costing-sheet" className="hidden print:block p-6 bg-white text-slate-900 font-sans print-only">
      
      {/* 1. Header with Brand & Meta */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black tracking-tight">
            <span className="text-blue-700">Masti</span>
            <span className="text-orange-500">Trips</span>
          </div>
          <div className="border-l-2 border-slate-300 pl-3">
            <h1 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Domestic Tour Package Costing & Quotation
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Confidential Travel Costing Sheet • All Rates in INR (₹)
            </p>
          </div>
        </div>

        <div className="text-right text-xs space-y-0.5">
          <div><span className="text-slate-500 font-bold">Quote Ref:</span> <strong className="font-mono text-slate-900">{packageData.id.toUpperCase()}</strong></div>
          <div><span className="text-slate-500 font-bold">Date:</span> <strong className="text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
        </div>
      </div>

      {/* 2. Tour & Passenger Master Overview (Clean 2-Row Box with Zero Truncation) */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 mb-4 text-xs space-y-2">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-6">
            <div className="text-[10px] uppercase font-bold text-slate-500">Tour Package Name</div>
            <div className="text-sm font-black text-slate-900 leading-tight">
              {packageDetails.packageName || 'Domestic Tour Package'}
            </div>
          </div>

          <div className="col-span-3">
            <div className="text-[10px] uppercase font-bold text-slate-500">Destination Route</div>
            <div className="text-xs font-bold text-slate-800">
              {packageDetails.destination || 'Standard Domestic Route'}
            </div>
          </div>

          <div className="col-span-3">
            <div className="text-[10px] uppercase font-bold text-slate-500">Duration & Date</div>
            <div className="text-xs font-bold text-slate-800">
              {packageDetails.days} Days / {packageDetails.nights} Nights
              {packageDetails.travelDate && <span className="block text-[11px] text-slate-600 font-normal">Travel: {packageDetails.travelDate}</span>}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-2 grid grid-cols-12 gap-3">
          <div className="col-span-6">
            <div className="text-[10px] uppercase font-bold text-slate-500">Passenger Composition</div>
            <div className="text-xs font-extrabold text-blue-900">
              {totalPax} Total Pax ({pax.adults} Adults + {pax.children} Children + {pax.infants} Infants)
              <span className="text-[11px] text-slate-600 font-normal ml-1">[{adultEquivalent.toFixed(2)} Adult Equiv Units]</span>
            </div>
          </div>

          <div className="col-span-6">
            <div className="text-[10px] uppercase font-bold text-slate-500">Tour Room Setup (All Hotels)</div>
            <div className="text-xs font-extrabold text-indigo-900">
              {allocation.doubleRooms} Double Rooms • {allocation.tripleRooms} Triple Rooms • {allocation.quadRooms} Quad Rooms
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hotels Table */}
      {hotels.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded-t border-t border-x border-slate-300">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              1. Hotel Accommodations & Room Costing
            </h2>
            <span className="text-xs font-black text-blue-700">
              Hotels Net: {formatINR(categoryTotals.hotels)}
            </span>
          </div>

          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-1.5 px-2">City / Destination</th>
                <th className="py-1.5 px-2">Hotel Name & Category</th>
                <th className="py-1.5 px-1.5 text-center">Nights</th>
                <th className="py-1.5 px-1.5 text-center">Plan</th>
                <th className="py-1.5 px-2 text-right">Double Rate</th>
                <th className="py-1.5 px-2 text-right">Extra Bed</th>
                <th className="py-1.5 px-2 text-right">Triple Rate</th>
                <th className="py-1.5 px-2 text-right">Quad Rate</th>
                <th className="py-1.5 px-2 text-right">Hotel Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {hotels.map((h, i) => {
                const c = calculateHotelItemCost(h, allocation);
                return (
                  <tr key={h.id}>
                    <td className="py-1.5 px-2 font-bold text-slate-900">
                      {h.destination || `Destination #${i + 1}`}
                    </td>
                    <td className="py-1.5 px-2">
                      <strong className="text-slate-800">{h.hotelName || 'Hotel Stay'}</strong>
                      {h.roomCategory && <span className="text-slate-500 block text-[10px]">({h.roomCategory})</span>}
                    </td>
                    <td className="py-1.5 px-1.5 text-center font-bold text-slate-800">{h.nights}N</td>
                    <td className="py-1.5 px-1.5 text-center font-semibold text-slate-700">{h.mealPlan}</td>
                    <td className="py-1.5 px-2 text-right font-medium">{formatINR(h.doubleRate || 0)}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600">{formatINR(h.extraBedRate || 0)}</td>
                    <td className="py-1.5 px-2 text-right text-blue-900 font-medium">{formatINR(c.tripleRate)}</td>
                    <td className="py-1.5 px-2 text-right text-indigo-900 font-medium">{formatINR(c.quadRate)}</td>
                    <td className="py-1.5 px-2 text-right font-black text-slate-900">{formatINR(c.totalCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Vehicles Table */}
      {vehicles.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded-t border-t border-x border-slate-300">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              2. Vehicles & Ground Transport
            </h2>
            <span className="text-xs font-black text-blue-700">
              Vehicles Net: {formatINR(categoryTotals.vehicles)}
            </span>
          </div>

          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-1.5 px-2">Vehicle Type</th>
                <th className="py-1.5 px-2">Vehicle Name / Description</th>
                <th className="py-1.5 px-2 text-center">Vehicles</th>
                <th className="py-1.5 px-2 text-center">Days</th>
                <th className="py-1.5 px-2">Costing Basis</th>
                <th className="py-1.5 px-2 text-right">Rate</th>
                <th className="py-1.5 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="py-1.5 px-2 font-bold text-slate-800">{v.vehicleType}</td>
                  <td className="py-1.5 px-2">{v.vehicleName || 'Standard Transport'}</td>
                  <td className="py-1.5 px-2 text-center font-bold">{v.numberOfVehicles}</td>
                  <td className="py-1.5 px-2 text-center font-bold">{v.costingBasis === 'per_day' ? v.numberOfDays : '-'}</td>
                  <td className="py-1.5 px-2 capitalize text-slate-600">{v.costingBasis.replace('_', ' ')}</td>
                  <td className="py-1.5 px-2 text-right">{formatINR(v.ratePerDay)}</td>
                  <td className="py-1.5 px-2 text-right font-black text-slate-900">{formatINR(calculateVehicleItemCost(v))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Flight & Train Fares Table */}
      {flightTrainFares && flightTrainFares.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded-t border-t border-x border-slate-300">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
              3. Flight & Train Transit Fares (Per Person)
            </h2>
            <span className="text-xs font-black text-sky-700">
              Fares Net: {formatINR(categoryTotals.flightTrainFares)}
            </span>
          </div>

          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-1.5 px-2">Mode & Class</th>
                <th className="py-1.5 px-2">Sector Route</th>
                <th className="py-1.5 px-2">Flight / Train No.</th>
                <th className="py-1.5 px-2 text-right">Adult Rate</th>
                <th className="py-1.5 px-2 text-right">Child Rate</th>
                <th className="py-1.5 px-2 text-center">Pax (A/C/I)</th>
                <th className="py-1.5 px-2 text-right">Sector Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {flightTrainFares.map((f) => {
                const sub = calculateFlightTrainFareItemCost(f, pax.childPercentage);
                return (
                  <tr key={f.id}>
                    <td className="py-1.5 px-2 font-bold text-slate-800">{f.transportType}</td>
                    <td className="py-1.5 px-2 font-semibold text-slate-900">{f.sector || 'Transit Sector'}</td>
                    <td className="py-1.5 px-2 text-slate-600">{f.flightOrTrainNumber || '-'}</td>
                    <td className="py-1.5 px-2 text-right">{formatINR(f.adultRate)}</td>
                    <td className="py-1.5 px-2 text-right">{formatINR(f.childRate !== null && f.childRate !== undefined ? f.childRate : f.adultRate * (pax.childPercentage / 100))}</td>
                    <td className="py-1.5 px-2 text-center font-mono">{f.adultQuantity}A / {f.childQuantity}C / {f.infantQuantity}I</td>
                    <td className="py-1.5 px-2 text-right font-black text-slate-900">{formatINR(sub)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Financial Summary Box (Supplier Net vs. Client Quotation) */}
      <div className="grid grid-cols-2 gap-4 border-2 border-slate-300 rounded-lg p-3.5 bg-slate-50 text-xs">
        
        {/* Left: Supplier Cost Subtotals */}
        <div className="space-y-1.5 border-r border-slate-300 pr-4">
          <div className="font-black text-slate-900 uppercase border-b border-slate-200 pb-1 text-xs">
            Supplier Net Cost Breakdown
          </div>
          <div className="flex justify-between text-slate-700"><span>Hotels Subtotal:</span> <strong className="text-slate-900">{formatINR(categoryTotals.hotels)}</strong></div>
          <div className="flex justify-between text-slate-700"><span>Vehicles Subtotal:</span> <strong className="text-slate-900">{formatINR(categoryTotals.vehicles)}</strong></div>
          <div className="flex justify-between text-slate-700"><span>Meals Subtotal:</span> <strong className="text-slate-900">{formatINR(categoryTotals.meals)}</strong></div>
          <div className="flex justify-between text-slate-700"><span>Activities Subtotal:</span> <strong className="text-slate-900">{formatINR(categoryTotals.activities)}</strong></div>
          <div className="flex justify-between text-slate-700"><span>Flight / Train Fares:</span> <strong className="text-slate-900">{formatINR(categoryTotals.flightTrainFares)}</strong></div>
          <div className="flex justify-between text-slate-700"><span>Other Services:</span> <strong className="text-slate-900">{formatINR(categoryTotals.otherServices)}</strong></div>
          
          <div className="flex justify-between text-sm font-black text-blue-900 border-t-2 border-slate-300 pt-1.5 mt-1">
            <span>TOTAL SUPPLIER NET:</span>
            <span>{formatINR(totalNetCost)}</span>
          </div>
        </div>

        {/* Right: Client Commercial Quotation */}
        <div className="space-y-1.5 pl-2">
          <div className="font-black text-slate-900 uppercase border-b border-slate-200 pb-1 text-xs">
            Client Commercial Quotation
          </div>
          
          <div className="flex justify-between text-slate-700">
            <span>Net Cost Per Adult:</span> <strong className="text-slate-900">{formatINR(adultCost)}</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Markup Margin ({pricingSettings.markupValue}{pricingSettings.markupType === 'percentage' ? '%' : ' ₹'}):</span>
            <strong className="text-emerald-700">+{formatINR(profit)} ({formatPercentage(marginPercentage)} Margin)</strong>
          </div>

          <div className="border-t-2 border-orange-500 pt-1.5 mt-2">
            <div className="flex justify-between text-base font-black text-orange-600">
              <span>FINAL SELLING PRICE:</span>
              <span>{formatINR(sellingPrice)}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-slate-900 mt-1">
              <span>Selling Per Adult: <strong className="text-blue-800">{formatINR(adultSellingPrice)}</strong></span>
              {pax.children > 0 && (
                <span>Selling Per Child: <strong className="text-amber-800">{formatINR(childSellingPrice)}</strong></span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 7. Footer */}
      <div className="mt-4 text-[10px] text-slate-500 border-t border-slate-200 pt-2 flex justify-between items-center">
        <span>Generated by MastiTrips Domestic Package Calculator</span>
        <span>Valid for 15 Days from Date of Quotation</span>
      </div>

    </div>
  );
};
