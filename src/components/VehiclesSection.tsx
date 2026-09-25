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
    <section className="bg-white rounded-lg border border-slate-300 shadow-2xs p-2 text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
            <Car className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Vehicles &amp; Transport
          </span>
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
            {vehicles.length} Units
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            Total Net: <strong className="text-blue-700 font-brand text-xs">{formatINR(totalCost)}</strong>
          </span>

          <button
            type="button"
            onClick={addVehicle}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      {vehicles.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-300 rounded bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">No transport vehicle added</p>
          <button
            type="button"
            onClick={addVehicle}
            className="mt-1 text-xs text-blue-600 font-bold hover:underline"
          >
            + Add Vehicle
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-300 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold border-b border-slate-300">
              <tr>
                <th className="py-1 px-1.5 w-36">Vehicle Type</th>
                <th className="py-1 px-1.5 min-w-[180px]">Vehicle Name / Model</th>
                <th className="py-1 px-1 text-center w-14">Qty</th>
                <th className="py-1 px-1 text-center w-14">Days</th>
                <th className="py-1 px-1.5 w-24">Basis</th>
                <th className="py-1 px-1.5 text-right w-24">Rate (₹)</th>
                <th className="py-1 px-1.5 text-right w-24">Subtotal</th>
                <th className="py-1 px-1 text-center w-14">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {vehicles.map((v, idx) => {
                const subtotal = calculateVehicleItemCost(v);
                return (
                  <tr key={v.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-1 px-1.5">
                      <select
                        value={v.vehicleType}
                        onChange={(e) => updateVehicle(idx, { ...v, vehicleType: e.target.value as VehicleType })}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
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
                    <td className="py-1 px-1.5">
                      <input
                        type="text"
                        value={v.vehicleName}
                        onChange={(e) => updateVehicle(idx, { ...v, vehicleName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <input
                        type="number"
                        min="1"
                        value={v.numberOfVehicles || ''}
                        onChange={(e) => updateVehicle(idx, { ...v, numberOfVehicles: parsePositiveNumber(e.target.value, 1) })}
                        className="w-11 bg-white border border-slate-300 rounded py-0.5 text-center font-black text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <input
                        type="number"
                        min="1"
                        disabled={v.costingBasis !== 'per_day'}
                        value={v.costingBasis === 'per_day' ? (v.numberOfDays || '') : '-'}
                        onChange={(e) => updateVehicle(idx, { ...v, numberOfDays: parsePositiveNumber(e.target.value, 1) })}
                        className="w-11 bg-white border border-slate-300 rounded py-0.5 text-center font-black text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <select
                        value={v.costingBasis}
                        onChange={(e) => updateVehicle(idx, { ...v, costingBasis: e.target.value as VehicleCostingBasis })}
                        className="w-full bg-white border border-slate-300 rounded px-1 py-0.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="per_day">Per Day</option>
                        <option value="per_trip">Per Trip</option>
                        <option value="fixed">Fixed Rate</option>
                      </select>
                    </td>
                    <td className="py-1 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={v.ratePerDay || ''}
                        onChange={(e) => updateVehicle(idx, { ...v, ratePerDay: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-black text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1.5 text-right font-black text-blue-700 font-brand whitespace-nowrap">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-1 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => duplicateVehicle(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                          title="Duplicate vehicle"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVehicle(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Delete vehicle"
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
