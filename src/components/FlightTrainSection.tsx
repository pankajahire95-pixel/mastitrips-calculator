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
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 transition hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Plane className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-brand">
            7. Flight & Train Fares (Per Person)
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Net Fares:</span>
            <span className="text-sm font-black text-sky-700 font-brand">{formatINR(totalCost)}</span>
          </div>

          <button
            type="button"
            onClick={addFare}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sector</span>
          </button>
        </div>
      </div>

      {/* Fares Table */}
      {flightTrainFares.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500">No flight or train sectors added (optional)</p>
          <button
            type="button"
            onClick={addFare}
            className="mt-1 text-xs text-blue-600 font-bold hover:underline"
          >
            + Add Flight / Train Sector Fare
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Mode / Class</th>
                <th className="py-2 px-2.5">Sector (Route)</th>
                <th className="py-2 px-2.5">Flight / Train No.</th>
                <th className="py-2 px-2 text-right">Adult Fare</th>
                <th className="py-2 px-2 text-right">Child Fare</th>
                <th className="py-2 px-2 text-center">Pax (A/C/I)</th>
                <th className="py-2 px-2.5 text-right">Subtotal</th>
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flightTrainFares.map((f, idx) => {
                const subtotal = calculateFlightTrainFareItemCost(f, pax.childPercentage);
                const hasCustomChild = f.childRate !== null && f.childRate !== undefined;
                return (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2.5">
                      <select
                        value={f.transportType}
                        onChange={(e) => updateFare(idx, { ...f, transportType: e.target.value as FareTransportType })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-slate-800"
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
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="e.g. DEL -> UDR"
                        value={f.sector}
                        onChange={(e) => updateFare(idx, { ...f, sector: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="6E-2041"
                        value={f.flightOrTrainNumber || ''}
                        onChange={(e) => updateFare(idx, { ...f, flightOrTrainNumber: e.target.value })}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        value={f.adultRate || ''}
                        onChange={(e) => updateFare(idx, { ...f, adultRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-1 text-right font-extrabold"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Auto (${pax.childPercentage}%)`}
                        value={hasCustomChild ? (f.childRate as number) : ''}
                        onChange={(e) => updateFare(idx, { ...f, childRate: e.target.value === '' ? null : parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-1 text-right text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          title="Adults"
                          value={f.adultQuantity ?? ''}
                          onChange={(e) => updateFare(idx, { ...f, adultQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded px-0.5 py-1 text-center font-bold text-xs"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          min="0"
                          title="Children"
                          value={f.childQuantity ?? ''}
                          onChange={(e) => updateFare(idx, { ...f, childQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded px-0.5 py-1 text-center font-bold text-amber-900 text-xs"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          min="0"
                          title="Infants"
                          value={f.infantQuantity ?? ''}
                          onChange={(e) => updateFare(idx, { ...f, infantQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded px-0.5 py-1 text-center font-bold text-pink-900 text-xs"
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-slate-800 font-brand">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateFare(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFare(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
