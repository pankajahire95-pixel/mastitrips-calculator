import React from 'react';
import { OtherServiceItem } from '../types';
import { calculateOtherServiceItemCost } from '../engine/calculator';
import { formatINR, generateUniqueId, parsePositiveNumber } from '../utils/formatters';
import { ShieldCheck, Plus, Trash2, Copy } from 'lucide-react';

interface OtherServicesSectionProps {
  otherServices: OtherServiceItem[];
  onChange: (services: OtherServiceItem[]) => void;
}

export const OtherServicesSection: React.FC<OtherServicesSectionProps> = ({
  otherServices,
  onChange,
}) => {
  const addService = () => {
    const newService: OtherServiceItem = {
      id: generateUniqueId('os'),
      serviceName: '',
      quantity: 1,
      rate: 500,
      notes: '',
    };
    onChange([...otherServices, newService]);
  };

  const updateService = (index: number, updated: OtherServiceItem) => {
    const next = [...otherServices];
    next[index] = updated;
    onChange(next);
  };

  const duplicateService = (index: number) => {
    const target = otherServices[index];
    const copy: OtherServiceItem = {
      ...target,
      id: generateUniqueId('os'),
      serviceName: target.serviceName ? `${target.serviceName} (Copy)` : '',
    };
    const next = [...otherServices];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const deleteService = (index: number) => {
    const next = otherServices.filter((_, i) => i !== index);
    onChange(next);
  };

  const totalCost = otherServices.reduce((sum, o) => sum + calculateOtherServiceItemCost(o), 0);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 transition hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-brand">
            8. Other Ancillary Services
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Net Services:</span>
            <span className="text-sm font-black text-indigo-700 font-brand">{formatINR(totalCost)}</span>
          </div>

          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Other Services Table */}
      {otherServices.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500">No extra ancillary services added (optional)</p>
          <button
            type="button"
            onClick={addService}
            className="mt-1 text-xs text-blue-600 font-bold hover:underline"
          >
            + Add Insurance / Welcome Garland / Permits
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Service Name & Description</th>
                <th className="py-2 px-2 text-center">Quantity</th>
                <th className="py-2 px-2.5 text-right">Rate (₹)</th>
                <th className="py-2 px-2.5">Notes</th>
                <th className="py-2 px-2.5 text-right">Subtotal</th>
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {otherServices.map((o, idx) => {
                const subtotal = calculateOtherServiceItemCost(o);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="e.g. Travel Insurance / Welcome Garland"
                        value={o.serviceName}
                        onChange={(e) => updateService(idx, { ...o, serviceName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={o.quantity || ''}
                        onChange={(e) => updateService(idx, { ...o, quantity: parsePositiveNumber(e.target.value, 1) })}
                        className="w-14 bg-white border border-slate-300 rounded px-1 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={o.rate || ''}
                        onChange={(e) => updateService(idx, { ...o, rate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-1 text-right font-extrabold"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={o.notes || ''}
                        onChange={(e) => updateService(idx, { ...o, notes: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-slate-800 font-brand">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateService(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(idx)}
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
