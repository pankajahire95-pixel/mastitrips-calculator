import React from 'react';
import { ActivityItem, PaxDetails } from '../types';
import { calculateActivityItemCost } from '../engine/calculator';
import { formatINR, generateUniqueId, parsePositiveNumber } from '../utils/formatters';
import { Ticket, Plus, Trash2, Copy } from 'lucide-react';

interface ActivitiesSectionProps {
  activities: ActivityItem[];
  pax: PaxDetails;
  onChange: (activities: ActivityItem[]) => void;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  pax,
  onChange,
}) => {
  const addActivity = () => {
    const newActivity: ActivityItem = {
      id: generateUniqueId('act'),
      activityName: '',
      destination: '',
      adultRate: 500,
      childRate: null,
      infantRate: 0,
      adultQuantity: pax.adults || 2,
      childQuantity: pax.children || 0,
      infantQuantity: 0,
    };
    onChange([...activities, newActivity]);
  };

  const updateActivity = (index: number, updated: ActivityItem) => {
    const next = [...activities];
    next[index] = updated;
    onChange(next);
  };

  const duplicateActivity = (index: number) => {
    const target = activities[index];
    const copy: ActivityItem = {
      ...target,
      id: generateUniqueId('act'),
      activityName: target.activityName ? `${target.activityName} (Copy)` : '',
    };
    const next = [...activities];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const deleteActivity = (index: number) => {
    const next = activities.filter((_, i) => i !== index);
    onChange(next);
  };

  const totalCost = activities.reduce((sum, a) => sum + calculateActivityItemCost(a, pax.childPercentage), 0);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 transition hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Ticket className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-brand">
            6. Activities & Experiences
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Net Activities:</span>
            <span className="text-sm font-black text-blue-700 font-brand">{formatINR(totalCost)}</span>
          </div>

          <button
            type="button"
            onClick={addActivity}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Table */}
      {activities.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500">No activities or safari tickets added</p>
          <button
            type="button"
            onClick={addActivity}
            className="mt-1 text-xs text-blue-600 font-bold hover:underline"
          >
            + Add Safari / Monument Entry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Activity / Safari / Monument</th>
                <th className="py-2 px-2.5">Destination</th>
                <th className="py-2 px-2.5 text-right">Adult Rate</th>
                <th className="py-2 px-2.5 text-right">Child Rate</th>
                <th className="py-2 px-2 text-center">Qty (A/C)</th>
                <th className="py-2 px-2.5 text-right">Subtotal</th>
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((a, idx) => {
                const subtotal = calculateActivityItemCost(a, pax.childPercentage);
                const hasCustomChild = a.childRate !== null && a.childRate !== undefined;
                return (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="e.g. Desert Safari / City Palace"
                        value={a.activityName}
                        onChange={(e) => updateActivity(idx, { ...a, activityName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="City"
                        value={a.destination}
                        onChange={(e) => updateActivity(idx, { ...a, destination: e.target.value })}
                        className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={a.adultRate || ''}
                        onChange={(e) => updateActivity(idx, { ...a, adultRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-right font-extrabold"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Auto (${pax.childPercentage}%)`}
                        value={hasCustomChild ? (a.childRate as number) : ''}
                        onChange={(e) => updateActivity(idx, { ...a, childRate: e.target.value === '' ? null : parsePositiveNumber(e.target.value, 0) })}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          title="Adults"
                          value={a.adultQuantity ?? ''}
                          onChange={(e) => updateActivity(idx, { ...a, adultQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-10 bg-white border border-slate-300 rounded px-1 py-1 text-center font-bold"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          min="0"
                          title="Children"
                          value={a.childQuantity ?? ''}
                          onChange={(e) => updateActivity(idx, { ...a, childQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-10 bg-white border border-slate-300 rounded px-1 py-1 text-center font-bold text-amber-900"
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
                          onClick={() => duplicateActivity(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteActivity(idx)}
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
