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
    <section className="bg-white rounded-lg border border-slate-300 shadow-2xs p-2 text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Other Ancillary Services
          </span>
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
            {otherServices.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            Total Net: <strong className="text-blue-700 font-brand text-xs">{formatINR(totalCost)}</strong>
          </span>

          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Other Services Table */}
      {otherServices.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">No extra ancillary services added (optional)</p>
          <button
            type="button"
            onClick={addService}
            className="mt-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            + Add Insurance / Welcome Garland / Permits
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5 min-w-[200px]">Service Name &amp; Description</th>
                <th className="py-2 px-1 text-center w-16">Qty</th>
                <th className="py-2 px-2.5 text-right w-26">Rate (₹)</th>
                <th className="py-2 px-2.5 min-w-[160px]">Notes</th>
                <th className="py-2 px-2.5 text-right w-28">Subtotal</th>
                <th className="py-2 px-1 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {otherServices.map((o, idx) => {
                const subtotal = calculateOtherServiceItemCost(o);
                return (
                  <tr key={o.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        placeholder="e.g. Travel Insurance / Welcome Garland"
                        value={o.serviceName}
                        onChange={(e) => updateService(idx, { ...o, serviceName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input
                        type="number"
                        min="1"
                        value={o.quantity || ''}
                        onChange={(e) => updateService(idx, { ...o, quantity: parsePositiveNumber(e.target.value, 1) })}
                        className="w-12 bg-white border border-slate-300 rounded-md py-1 text-center font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={o.rate || ''}
                        onChange={(e) => updateService(idx, { ...o, rate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-22 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-right font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={o.notes || ''}
                        onChange={(e) => updateService(idx, { ...o, notes: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-right font-black text-blue-700 font-brand text-xs sm:text-sm whitespace-nowrap">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateService(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition cursor-pointer"
                          title="Duplicate service"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title="Delete service"
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
      )}
    </section>
  );
};
