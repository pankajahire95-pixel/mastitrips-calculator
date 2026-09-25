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
    <section className="bg-white rounded-lg border border-slate-300 shadow-2xs p-2 text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
            <Ticket className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Activities &amp; Experiences
          </span>
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
            {activities.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            Total Net: <strong className="text-blue-700 font-brand text-xs">{formatINR(totalCost)}</strong>
          </span>

          <button
            type="button"
            onClick={addActivity}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Table */}
      {activities.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-300 rounded bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">No activities or safari tickets added</p>
          <button
            type="button"
            onClick={addActivity}
            className="mt-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            + Add Safari / Monument Entry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-300 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold border-b border-slate-300">
              <tr>
                <th className="py-1 px-1.5 min-w-[180px]">Activity / Safari / Monument</th>
                <th className="py-1 px-1.5 w-28">Destination</th>
                <th className="py-1 px-1.5 text-right w-24">Adult Rate</th>
                <th className="py-1 px-1.5 text-right w-24">Child Rate</th>
                <th className="py-1 px-1 text-center w-24">Qty (A/C)</th>
                <th className="py-1 px-1.5 text-right w-24">Subtotal</th>
                <th className="py-1 px-1 text-center w-14">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {activities.map((a, idx) => {
                const subtotal = calculateActivityItemCost(a, pax.childPercentage);
                const hasCustomChild = a.childRate !== null && a.childRate !== undefined;
                return (
                  <tr key={a.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-1 px-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Desert Safari / City Palace"
                        value={a.activityName}
                        onChange={(e) => updateActivity(idx, { ...a, activityName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <input
                        type="text"
                        placeholder="City"
                        value={a.destination}
                        onChange={(e) => updateActivity(idx, { ...a, destination: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={a.adultRate || ''}
                        onChange={(e) => updateActivity(idx, { ...a, adultRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-black text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Auto (${pax.childPercentage}%)`}
                        value={hasCustomChild ? (a.childRate as number) : ''}
                        onChange={(e) => updateActivity(idx, { ...a, childRate: e.target.value === '' ? null : parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-1 px-1 text-center">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          title="Adults"
                          value={a.adultQuantity ?? ''}
                          onChange={(e) => updateActivity(idx, { ...a, adultQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded py-0.5 text-center font-black text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400 font-bold">/</span>
                        <input
                          type="number"
                          min="0"
                          title="Children"
                          value={a.childQuantity ?? ''}
                          onChange={(e) => updateActivity(idx, { ...a, childQuantity: parsePositiveNumber(e.target.value, 0) })}
                          className="w-8 bg-white border border-slate-300 rounded py-0.5 text-center font-black text-xs text-amber-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </td>
                    <td className="py-1 px-1.5 text-right font-black text-blue-700 font-brand whitespace-nowrap">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-1 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => duplicateActivity(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                          title="Duplicate activity"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteActivity(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Delete activity"
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
