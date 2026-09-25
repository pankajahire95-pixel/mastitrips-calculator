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
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 transition hover:border-slate-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <UtensilsCrossed className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-brand">
            5. Meals & Catering
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Net Meals:</span>
            <span className="text-sm font-black text-blue-700 font-brand">{formatINR(totalCost)}</span>
          </div>

          <button
            type="button"
            onClick={addMeal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Meals Table */}
      {meals.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500">No extra meals added (Hotels include standard plan)</p>
          <button
            type="button"
            onClick={addMeal}
            className="mt-1 text-xs text-blue-600 font-bold hover:underline"
          >
            + Add En-route / Special Meal
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Meal Name / Description</th>
                <th className="py-2 px-2.5">Type</th>
                <th className="py-2 px-2 text-center">Meals</th>
                <th className="py-2 px-2.5 text-right">Adult Rate</th>
                <th className="py-2 px-2.5 text-right">Child Rate</th>
                <th className="py-2 px-2.5 text-right">Subtotal</th>
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meals.map((m, idx) => {
                const subtotal = calculateMealItemCost(m, pax);
                const hasCustomChild = m.childRate !== null && m.childRate !== undefined;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        placeholder="e.g. Traditional Thali"
                        value={m.mealName}
                        onChange={(e) => updateMeal(idx, { ...m, mealName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <select
                        value={m.mealType}
                        onChange={(e) => updateMeal(idx, { ...m, mealType: e.target.value as MealType })}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs"
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
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={m.numberOfMeals || ''}
                        onChange={(e) => updateMeal(idx, { ...m, numberOfMeals: parsePositiveNumber(e.target.value, 1) })}
                        className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={m.adultRate || ''}
                        onChange={(e) => updateMeal(idx, { ...m, adultRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-right font-extrabold"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Auto (${pax.childPercentage}%)`}
                        value={hasCustomChild ? (m.childRate as number) : ''}
                        onChange={(e) => updateMeal(idx, { ...m, childRate: e.target.value === '' ? null : parsePositiveNumber(e.target.value, 0) })}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-xs"
                      />
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-black text-slate-800 font-brand">
                      {formatINR(subtotal)}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateMeal(idx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMeal(idx)}
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
