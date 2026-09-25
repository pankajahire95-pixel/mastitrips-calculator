import React from 'react';
import { FlightTrainFareItem, PaxDetails, FareTransportType } from '../types';
import { calculateFlightTrainFareItemCost } from '../engine/calculator';
import { formatINR, generateUniqueId, parsePositiveNumber } from '../utils/formatters';
import { Plane, Plus, Trash2, Copy } from 'lucide-react';

interface FlightTrainSectionProps {
  flightTrainFares: FlightTrainFareItem[];
  pax: PaxDetails;
  onChange: (fares: FlightTrainFareItem[]) => void;
}

export const FlightTrainSection: React.FC<FlightTrainSectionProps> = ({
  flightTrainFares,
  pax,
  onChange,
}) => {
  const addFare = () => {
    const newFare: FlightTrainFareItem = {
      id: generateUniqueId('fare'),
      transportType: 'Flight',
      sector: '',
      flightOrTrainNumber: '',
      adultRate: 3500,
      childRate: null,
      infantRate: 1500,
      adultQuantity: pax.adults || 2,
      childQuantity: pax.children || 0,
      infantQuantity: pax.infants || 0,
      notes: '',
    };
    onChange([...flightTrainFares, newFare]);
  };

  const updateFare = (index: number, updated: FlightTrainFareItem) => {
    const next = [...flightTrainFares];
    next[index] = updated;
    onChange(next);
  };

  const duplicateFare = (index: number) => {
    const target = flightTrainFares[index];
    const copy: FlightTrainFareItem = {
      ...target,
      id: generateUniqueId('fare'),
      sector: target.sector ? `${target.sector} (Copy)` : '',
    };
    const next = [...flightTrainFares];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const deleteFare = (index: number) => {
    const next = flightTrainFares.filter((_, i) => i !== index);
    onChange(next);
  };

  const totalCost = flightTrainFares.reduce((sum, f) => sum + calculateFlightTrainFareItemCost(f, pax.childPercentage), 0);

  return (
    <section className="bg-white rounded-lg border border-slate-300 shadow-2xs p-2 text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
            <Plane className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Flight &amp; Train Fares
          </span>
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
            {flightTrainFares.length} Sectors
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            Total Net: <strong className="text-blue-700 font-brand text-xs">{formatINR(totalCost)}</strong>
          </span>

          <button
            type="button"
            onClick={addFare}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Sector</span>
          </button>
        </div>
      </div>

      {/* Fares Table */}
      {flightTrainFares.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">No flight or train sectors added (optional)</p>
          <button
            type="button"
            onClick={addFare}
            className="mt-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            + Add Flight / Train Sector Fare
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="lg:hidden flex items-center justify-end text-[10px] text-slate-500 font-semibold px-1">
            <span>⇄ Swipe horizontally to edit all columns</span>
          </div>
          <div className="border border-slate-200 rounded-lg shadow-2xs overflow-x-auto lg:overflow-hidden bg-white touch-pan-x">
            <table className="min-w-[700px] lg:min-w-0 w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2 px-2 w-28">Mode / Class</th>
                <th className="py-2 px-2">Sector (Route)</th>
                <th className="py-2 px-1.5 w-20">Flight/Train #</th>
                <th className="py-2 px-1.5 text-right w-20">Adult Fare</th>
                <th className="py-2 px-1.5 text-right w-20">Child Fare</th>
                <th className="py-2 px-1 text-center w-26">Pax (A/C/I)</th>
                <th className="py-2 px-2 text-right w-22">Subtotal</th>
                <th className="py-2 px-1 text-center w-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {flightTrainFares.map((f, idx) => {
                const subtotal = calculateFlightTrainFareItemCost(f, pax.childPercentage);
                const hasCustomChild = f.childRate !== null && f.childRate !== undefined;
                return (
                  <tr key={f.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2 px-2">
                      <select
                        value={f.transportType}
                        onChange={(e) => updateFare(idx, { ...f, transportType: e.target.value as FareTransportType })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      >
                        <option value="Flight">Flight</option>
                        <option value="Train (1st AC)">Train (1st AC)</option>
                        <option value="Train (2nd AC)">Train (2nd AC)</option>
                        <option value="Train (3rd AC)">Train (3rd AC)</option>
                        <option value="Train (Chair Car CC)">Train (CC)</option>
                        <option value="Train (Sleeper SL)">Train (Sleeper)</option>
                        <option value="Volvo / AC Bus">Volvo / Bus</option>
                        <option value="Other Transit">Other</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. DEL -> UDR"
                        value={f.sector}
                        onChange={(e) => updateFare(idx, { ...f, sector: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1.5">
                      <input
                        type="text"
                        placeholder="6E-2041"
                        value={f.flightOrTrainNumber || ''}
                        onChange={(e) => updateFare(idx, { ...f, flightOrTrainNumber: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={f.adultRate || ''}
                        onChange={(e) => updateFare(idx, { ...f, adultRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-right font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Auto (${pax.childPercentage}%)`}
                        value={hasCustomChild ? (f.childRate as number) : ''}
                        onChange={(e) => updateFare(idx, { ...f, childRate: e.target.value === '' ? null : parsePositiveNumber(e.target.value, 0) })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-right text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <div className="inline-flex items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          title="Adults"
                          value={f.adultQuantity ?? ''}
                          onChange={(e) => updateFare(idx, { ...f, adultQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded-md py-1 text-center font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                        />
                        <span className="text-slate-400 font-bold">/</span>
                        <input
                          type="number"
                          min="0"
                          title="Children"
                          value={f.childQuantity ?? ''}
                          onChange={(e) => updateFare(idx, { ...f, childQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded-md py-1 text-center font-black text-xs text-amber-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                        />
                        <span className="text-slate-400 font-bold">/</span>
                        <input
                          type="number"
                          min="0"
                          title="Infants"
                          value={f.infantQuantity ?? ''}
                          onChange={(e) => updateFare(idx, { ...f, infantQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded-md py-1 text-center font-black text-xs text-pink-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-black text-blue-700 font-brand text-xs whitespace-nowrap">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => duplicateFare(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition cursor-pointer"
                          title="Duplicate sector"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFare(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title="Delete sector"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </section>
);
};
