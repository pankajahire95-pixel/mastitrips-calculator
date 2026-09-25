import React from 'react';
import { VehicleItem, PaxDetails, VehicleType, VehicleCostingBasis } from '../types';
import { calculateVehicleItemCost } from '../engine/calculator';
import { formatINR, generateUniqueId, parsePositiveNumber } from '../utils/formatters';
import { Car, Plus, Trash2, Copy } from 'lucide-react';

interface VehiclesSectionProps {
  vehicles: VehicleItem[];
  pax: PaxDetails;
  packageDays: number;
  onChange: (vehicles: VehicleItem[]) => void;
}

export const VehiclesSection: React.FC<VehiclesSectionProps> = ({
  vehicles,
  pax,
  packageDays,
  onChange,
}) => {
  const addVehicle = () => {
    const newVehicle: VehicleItem = {
      id: generateUniqueId('veh'),
      vehicleType: 'Innova Crysta',
      vehicleName: 'Toyota Innova Crysta (6+1 AC)',
      numberOfVehicles: 1,
      numberOfDays: packageDays > 0 ? packageDays : 1,
      ratePerDay: 4000,
      costingBasis: 'per_day',
    };
    onChange([...vehicles, newVehicle]);
  };

  const updateVehicle = (index: number, updated: VehicleItem) => {
    const next = [...vehicles];
    next[index] = updated;
    onChange(next);
  };

  const duplicateVehicle = (index: number) => {
    const target = vehicles[index];
    const copy: VehicleItem = {
      ...target,
      id: generateUniqueId('veh'),
      vehicleName: target.vehicleName ? `${target.vehicleName} (Copy)` : '',
    };
    const next = [...vehicles];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const deleteVehicle = (index: number) => {
    const next = vehicles.filter((_, i) => i !== index);
    onChange(next);
  };

  const totalCost = vehicles.reduce((sum, v) => sum + calculateVehicleItemCost(v), 0);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 transition hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Car className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-brand">
            4. Vehicles & Transport
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Net Vehicles:</span>
            <span className="text-sm font-black text-blue-700 font-brand">{formatINR(totalCost)}</span>
          </div>

          <button
            type="button"
            onClick={addVehicle}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      {vehicles.length === 0 ? (
        <div className="text-center py-5 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500">No transport vehicle added</p>
          <button
            type="button"
            onClick={addVehicle}
            className="mt-1.5 text-xs text-blue-600 font-bold hover:underline"
          >
            + Add Vehicle
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Vehicle Type</th>
                <th className="py-2 px-2.5">Vehicle Name / Model</th>
                <th className="py-2 px-2 text-center">Vehicles</th>
                <th className="py-2 px-2 text-center">Days</th>
                <th className="py-2 px-2.5">Costing Basis</th>
                <th className="py-2 px-2.5 text-right">Rate (₹)</th>
                <th className="py-2 px-2.5 text-right">Subtotal</th>
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v, idx) => {
                const subtotal = calculateVehicleItemCost(v);
                return (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2.5">
                      <select
                        value={v.vehicleType}
                        onChange={(e) => updateVehicle(idx, { ...v, vehicleType: e.target.value as VehicleType })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold"
                      >
                        <option value="Sedan">Sedan (Dzire/Etios)</option>
                        <option value="Ertiga">Ertiga (6 Pax)</option>
                        <option value="Innova">Innova</option>
                        <option value="Innova Crysta">Innova Crysta</option>
                        <option value="Tempo Traveller">Tempo Traveller</option>
                        <option value="Mini Bus">Mini Bus</option>
                        <option value="Bus">Bus</option>
                        <option value="Custom Vehicle">Custom Vehicle</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        value={v.vehicleName}
                        onChange={(e) => updateVehicle(idx, { ...v, vehicleName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={v.numberOfVehicles || ''}
                        onChange={(e) => updateVehicle(idx, { ...v, numberOfVehicles: parsePositiveNumber(e.target.value, 1) })}
                        className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        disabled={v.costingBasis !== 'per_day'}
                        value={v.costingBasis === 'per_day' ? (v.numberOfDays || '') : '-'}
                        onChange={(e) => updateVehicle(idx, { ...v, numberOfDays: parsePositiveNumber(e.target.value, 1) })}
                        className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center font-bold disabled:bg-slate-100"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <select
                        value={v.costingBasis}
                        onChange={(e) => updateVehicle(idx, { ...v, costingBasis: e.target.value as VehicleCostingBasis })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs font-medium"
                      >
                        <option value="per_day">Per Day</option>
                        <option value="per_trip">Per Trip</option>
                        <option value="fixed">Fixed Rate</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={v.ratePerDay || ''}
                        onChange={(e) => updateVehicle(idx, { ...v, ratePerDay: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-right font-extrabold"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-slate-800 font-brand">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateVehicle(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVehicle(idx)}
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
