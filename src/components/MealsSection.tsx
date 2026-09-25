import React from 'react';
import { MealItem, PaxDetails, MealType } from '../types';
import { calculateMealItemCost } from '../engine/calculator';
import { formatINR, generateUniqueId, parsePositiveNumber } from '../utils/formatters';
import { UtensilsCrossed, Plus, Trash2, Copy } from 'lucide-react';

interface MealsSectionProps {
  meals: MealItem[];
  pax: PaxDetails;
  onChange: (meals: MealItem[]) => void;
}

export const MealsSection: React.FC<MealsSectionProps> = ({
  meals,
  pax,
  onChange,
}) => {
  const addMeal = () => {
    const newMeal: MealItem = {
      id: generateUniqueId('meal'),
      mealName: '',
      mealType: 'Dinner',
      numberOfMeals: 1,
      adultRate: 450,
      childRate: null,
      infantRate: 0,
    };
    onChange([...meals, newMeal]);
  };

  const updateMeal = (index: number, updated: MealItem) => {
    const next = [...meals];
    next[index] = updated;
    onChange(next);
  };

  const duplicateMeal = (index: number) => {
    const target = meals[index];
    const copy: MealItem = {
      ...target,
      id: generateUniqueId('meal'),
      mealName: target.mealName ? `${target.mealName} (Copy)` : '',
    };
    const next = [...meals];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const deleteMeal = (index: number) => {
    const next = meals.filter((_, i) => i !== index);
    onChange(next);
  };

  const totalCost = meals.reduce((sum, m) => sum + calculateMealItemCost(m, pax), 0);

  return (
    <section className="bg-white rounded-lg border border-slate-300 shadow-2xs p-2 text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Meals &amp; Catering
          </span>
          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
            {meals.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            Total Net: <strong className="text-blue-700 font-brand text-xs">{formatINR(totalCost)}</strong>
          </span>

          <button
            type="button"
            onClick={addMeal}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Meals Table */}
      {meals.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">No extra meals added (Hotels include standard plan)</p>
          <button
            type="button"
            onClick={addMeal}
            className="mt-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            + Add En-route / Special Meal
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="lg:hidden flex items-center justify-end text-[10px] text-slate-500 font-semibold px-1">
            <span>⇄ Swipe horizontally to edit all columns</span>
          </div>
          <div className="border border-slate-200 rounded-lg shadow-2xs overflow-x-auto lg:overflow-hidden bg-white touch-pan-x">
            <table className="min-w-[660px] lg:min-w-0 w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2 px-2">Meal Name / Description</th>
                <th className="py-2 px-2 w-28">Type</th>
                <th className="py-2 px-1 text-center w-12">Meals</th>
                <th className="py-2 px-1.5 text-right w-20">Adult Rate</th>
                <th className="py-2 px-1.5 text-right w-22">Child Rate</th>
                <th className="py-2 px-2 text-right w-22">Subtotal</th>
                <th className="py-2 px-1 text-center w-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {meals.map((m, idx) => {
                const subtotal = calculateMealItemCost(m, pax);
                const hasCustomChild = m.childRate !== null && m.childRate !== undefined;
                return (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Traditional Thali"
                        value={m.mealName}
                        onChange={(e) => updateMeal(idx, { ...m, mealName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={m.mealType}
                        onChange={(e) => updateMeal(idx, { ...m, mealType: e.target.value as MealType })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Special Dinner">Special Dinner</option>
                        <option value="Buffet">Buffet</option>
                        <option value="Jain Meal">Jain Meal</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td className="py-2 px-1 text-center">
                      <input
                        type="number"
                        min="1"
                        value={m.numberOfMeals || ''}
                        onChange={(e) => updateMeal(idx, { ...m, numberOfMeals: parsePositiveNumber(e.target.value, 1) })}
                        className="w-10 bg-white border border-slate-300 rounded-md py-1 text-center font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={m.adultRate || ''}
                        onChange={(e) => updateMeal(idx, { ...m, adultRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-right font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Auto (${pax.childPercentage}%)`}
                        value={hasCustomChild ? (m.childRate as number) : ''}
                        onChange={(e) => updateMeal(idx, { ...m, childRate: e.target.value === '' ? null : parsePositiveNumber(e.target.value, 0) })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-right text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-black text-blue-700 font-brand text-xs whitespace-nowrap">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => duplicateMeal(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition cursor-pointer"
                          title="Duplicate meal"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMeal(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title="Delete meal"
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
