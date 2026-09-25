import React, { useState } from 'react';
import { HotelItem, HotelOption, PaxDetails, RoomAllocation, MealPlanType } from '../types';
import { calculateHotelItemCost, suggestRoomConfigurations } from '../engine/calculator';
import { formatINR, generateUniqueId, parsePositiveNumber } from '../utils/formatters';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Copy, 
  BedDouble, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Layers,
  Users
} from 'lucide-react';

interface HotelsSectionProps {
  hotels: HotelItem[];
  pax: PaxDetails;
  roomAllocation: RoomAllocation;
  packageNights: number;
  onUpdateRoomAllocation: (allocation: RoomAllocation) => void;
  onChangeHotels: (hotels: HotelItem[]) => void;
  onOpenAuditModal: () => void;
}

function ensureHotelWithOptions(hotel: HotelItem): {
  normalized: HotelItem;
  options: HotelOption[];
  selectedOptionId: string;
} {
  if (hotel.options && hotel.options.length > 0) {
    const selectedId = (hotel.selectedOptionId && hotel.options.some(o => o.id === hotel.selectedOptionId))
      ? hotel.selectedOptionId
      : hotel.options[0].id;
    return {
      normalized: { ...hotel, selectedOptionId: selectedId },
      options: hotel.options,
      selectedOptionId: selectedId,
    };
  }

  const defaultOptionId = generateUniqueId('opt');
  const defaultOption: HotelOption = {
    id: defaultOptionId,
    hotelName: hotel.hotelName || '',
    roomCategory: hotel.roomCategory || 'Deluxe Room',
    mealPlan: hotel.mealPlan || 'CP',
    doubleRate: hotel.doubleRate ?? 3500,
    extraBedRate: hotel.extraBedRate ?? 1200,
    supplier: hotel.supplier || '',
    notes: hotel.notes || '',
  };

  const normalized: HotelItem = {
    ...hotel,
    options: [defaultOption],
    selectedOptionId: defaultOptionId,
  };

  return {
    normalized,
    options: [defaultOption],
    selectedOptionId: defaultOptionId,
  };
}

export const HotelsSection: React.FC<HotelsSectionProps> = ({
  hotels,
  pax,
  roomAllocation,
  packageNights,
  onUpdateRoomAllocation,
  onChangeHotels,
}) => {
  const totalPayingPax = (pax.adults || 0) + (pax.children || 0);
  const roomSuggestions = suggestRoomConfigurations(pax.adults || 0, pax.children || 0);

  const totalAllocatedCapacity = 
    ((roomAllocation?.doubleRooms || 0) * 2) + 
    ((roomAllocation?.tripleRooms || 0) * 3) + 
    ((roomAllocation?.quadRooms || 0) * 4);

  const isTourCapacitySufficient = totalPayingPax === 0 || totalAllocatedCapacity >= totalPayingPax;

  const addHotel = () => {
    const optId = generateUniqueId('opt');
    const defaultOption: HotelOption = {
      id: optId,
      hotelName: '',
      roomCategory: 'Deluxe Room',
      mealPlan: 'CP',
      doubleRate: 3500,
      extraBedRate: 1200,
      supplier: '',
      notes: '',
    };

    const newHotel: HotelItem = {
      id: generateUniqueId('hotel'),
      destination: '',
      hotelName: '',
      roomCategory: 'Deluxe Room',
      mealPlan: 'CP',
      nights: 1,
      doubleRate: 3500,
      extraBedRate: 1200,
      supplier: '',
      notes: '',
      options: [defaultOption],
      selectedOptionId: optId,
    };
    onChangeHotels([...hotels, newHotel]);
  };

  const updateDestinationFields = (hotelIndex: number, fields: { destination?: string; nights?: number }) => {
    const hotel = hotels[hotelIndex];
    const { normalized } = ensureHotelWithOptions(hotel);
    const updatedHotel: HotelItem = {
      ...normalized,
      ...fields,
    };
    const next = [...hotels];
    next[hotelIndex] = updatedHotel;
    onChangeHotels(next);
  };

  const addHotelOption = (hotelIndex: number) => {
    const hotel = hotels[hotelIndex];
    const { normalized, options } = ensureHotelWithOptions(hotel);
    const newOptId = generateUniqueId('opt');
    const prevOption = options[options.length - 1];

    const newOption: HotelOption = {
      id: newOptId,
      hotelName: '',
      roomCategory: prevOption ? prevOption.roomCategory : 'Deluxe Room',
      mealPlan: prevOption ? prevOption.mealPlan : 'CP',
      doubleRate: prevOption ? prevOption.doubleRate : 3500,
      extraBedRate: prevOption ? prevOption.extraBedRate : 1200,
      supplier: '',
      notes: '',
    };

    const updatedOptions = [...options, newOption];
    const updatedHotel: HotelItem = {
      ...normalized,
      options: updatedOptions,
      selectedOptionId: newOptId,
      hotelName: newOption.hotelName,
      roomCategory: newOption.roomCategory,
      mealPlan: newOption.mealPlan,
      doubleRate: newOption.doubleRate,
      extraBedRate: newOption.extraBedRate,
    };

    const next = [...hotels];
    next[hotelIndex] = updatedHotel;
    onChangeHotels(next);
  };

  const selectHotelOptionForCalculation = (hotelIndex: number, optionId: string) => {
    const hotel = hotels[hotelIndex];
    const { normalized, options } = ensureHotelWithOptions(hotel);
    const chosen = options.find(o => o.id === optionId) || options[0];
    
    const updatedHotel: HotelItem = {
      ...normalized,
      selectedOptionId: chosen.id,
      hotelName: chosen.hotelName,
      roomCategory: chosen.roomCategory,
      mealPlan: chosen.mealPlan,
      doubleRate: chosen.doubleRate,
      extraBedRate: chosen.extraBedRate,
      supplier: chosen.supplier,
      notes: chosen.notes,
      options,
    };

    const next = [...hotels];
    next[hotelIndex] = updatedHotel;
    onChangeHotels(next);
  };

  const updateHotelOption = (hotelIndex: number, optionId: string, updatedFields: Partial<HotelOption>) => {
    const hotel = hotels[hotelIndex];
    const { normalized, options, selectedOptionId } = ensureHotelWithOptions(hotel);

    const nextOptions = options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, ...updatedFields };
      }
      return opt;
    });

    const activeOpt = nextOptions.find(o => o.id === selectedOptionId) || nextOptions[0];

    const updatedHotel: HotelItem = {
      ...normalized,
      options: nextOptions,
      selectedOptionId: activeOpt.id,
      hotelName: activeOpt.hotelName,
      roomCategory: activeOpt.roomCategory,
      mealPlan: activeOpt.mealPlan,
      doubleRate: activeOpt.doubleRate,
      extraBedRate: activeOpt.extraBedRate,
      supplier: activeOpt.supplier,
      notes: activeOpt.notes,
    };

    const next = [...hotels];
    next[hotelIndex] = updatedHotel;
    onChangeHotels(next);
  };

  const duplicateHotel = (index: number) => {
    const target = hotels[index];
    const { normalized, options } = ensureHotelWithOptions(target);
    const clonedOptions: HotelOption[] = options.map(o => ({
      ...o,
      id: generateUniqueId('opt'),
    }));

    const copy: HotelItem = {
      ...normalized,
      id: generateUniqueId('hotel'),
      destination: target.destination ? `${target.destination} (Copy)` : '',
      options: clonedOptions,
      selectedOptionId: clonedOptions[0].id,
      hotelName: clonedOptions[0].hotelName,
      roomCategory: clonedOptions[0].roomCategory,
      mealPlan: clonedOptions[0].mealPlan,
      doubleRate: clonedOptions[0].doubleRate,
      extraBedRate: clonedOptions[0].extraBedRate,
    };

    const next = [...hotels];
    next.splice(index + 1, 0, copy);
    onChangeHotels(next);
  };

  const deleteHotel = (index: number) => {
    const next = hotels.filter((_, i) => i !== index);
    onChangeHotels(next);
  };

  const totalHotelCost = hotels.reduce((sum, h) => sum + calculateHotelItemCost(h, roomAllocation).totalCost, 0);
  const totalHotelNights = hotels.reduce((sum, h) => sum + (h.nights || 0), 0);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 transition">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-wider text-xs font-brand">
            3. Hotels &amp; Accommodations
          </span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-200">
            {hotels.length} Stays • {totalHotelNights} Nights
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">
            Total Net: <strong className="text-blue-700 font-brand text-sm ml-1">{formatINR(totalHotelCost)}</strong>
          </span>

          <button
            type="button"
            onClick={addHotel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stay</span>
          </button>
        </div>
      </div>

      {/* 2. Room Allocation Toolbar (Proper, Comfortable Input Strip) */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-2 mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Room Allocation:
          </span>

          {/* Double Rooms */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2 py-1 shadow-2xs">
            <span className="text-slate-600 font-semibold">Double (2/Rm):</span>
            <input
              type="number"
              min="0"
              value={roomAllocation.doubleRooms ?? ''}
              onChange={(e) => onUpdateRoomAllocation({
                ...roomAllocation,
                doubleRooms: parsePositiveNumber(e.target.value, 0),
              })}
              className="w-9 text-center font-black text-slate-900 bg-transparent outline-none text-xs"
            />
          </div>

          {/* Triple Rooms */}
          <div className="flex items-center gap-1.5 bg-white border border-blue-300 rounded-md px-2 py-1 shadow-2xs">
            <span className="text-blue-800 font-semibold">Triple (3/Rm):</span>
            <input
              type="number"
              min="0"
              value={roomAllocation.tripleRooms ?? ''}
              onChange={(e) => onUpdateRoomAllocation({
                ...roomAllocation,
                tripleRooms: parsePositiveNumber(e.target.value, 0),
              })}
              className="w-9 text-center font-black text-blue-900 bg-transparent outline-none text-xs"
            />
          </div>

          {/* Quad Rooms */}
          <div className="flex items-center gap-1.5 bg-white border border-indigo-300 rounded-md px-2 py-1 shadow-2xs">
            <span className="text-indigo-800 font-semibold">Quad (4/Rm):</span>
            <input
              type="number"
              min="0"
              value={roomAllocation.quadRooms ?? ''}
              onChange={(e) => onUpdateRoomAllocation({
                ...roomAllocation,
                quadRooms: parsePositiveNumber(e.target.value, 0),
              })}
              className="w-9 text-center font-black text-indigo-900 bg-transparent outline-none text-xs"
            />
          </div>

          {/* Capacity Status */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-extrabold ${
            isTourCapacitySufficient
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {isTourCapacitySufficient ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>Capacity: <strong>{totalAllocatedCapacity} Pax</strong> ({totalPayingPax} Req)</span>
          </span>
        </div>

        {/* 1-Click Suggestions */}
        {roomSuggestions.length > 0 && totalPayingPax > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold hidden md:inline">Quick Setup:</span>
            {roomSuggestions.slice(0, 2).map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onUpdateRoomAllocation(sug.allocation)}
                className="px-2 py-1 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-md text-xs font-bold text-blue-900 transition cursor-pointer shadow-2xs"
                title="1-Click apply room distribution"
              >
                {sug.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Proper Spreadsheet Table */}
      {hotels.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
          <p className="text-xs text-slate-500 font-semibold">No hotel stays added</p>
          <button
            type="button"
            onClick={addHotel}
            className="mt-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            + Add First Destination Stay
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg shadow-2xs overflow-hidden bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2 px-1 text-center w-7">#</th>
                <th className="py-2 px-2 w-28">Destination *</th>
                <th className="py-2 px-1 text-center w-12">Nights</th>
                <th className="py-2 px-2">Hotel Name / Options *</th>
                <th className="py-2 px-2 w-24">Room Category</th>
                <th className="py-2 px-1 text-center w-14">Plan</th>
                <th className="py-2 px-1.5 w-20 text-right">Dbl Rate (₹)</th>
                <th className="py-2 px-1.5 w-18 text-right">Ex.Bed (₹)</th>
                <th className="py-2 px-2 w-22 text-right">Subtotal</th>
                <th className="py-2 px-1 text-center w-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {hotels.map((rawHotel, hotelIndex) => {
                const { normalized, options, selectedOptionId } = ensureHotelWithOptions(rawHotel);
                const calc = calculateHotelItemCost(normalized, roomAllocation);
                const activeOption = options.find(o => o.id === selectedOptionId) || options[0];

                return (
                  <tr key={normalized.id} className="hover:bg-blue-50/40 transition">
                    {/* Index */}
                    <td className="py-2 px-1 text-center font-bold text-slate-500 bg-slate-50/50">
                      {hotelIndex + 1}
                    </td>

                    {/* Destination City */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Amritsar"
                        value={normalized.destination}
                        onChange={(e) => updateDestinationFields(hotelIndex, { destination: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Nights */}
                    <td className="py-2 px-1 text-center">
                      <input
                        type="number"
                        min="1"
                        value={normalized.nights || ''}
                        onChange={(e) => updateDestinationFields(hotelIndex, { nights: parsePositiveNumber(e.target.value, 1) })}
                        className="w-10 text-center bg-white border border-slate-300 rounded-md py-1 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Hotel Name + Multi-Option Selector */}
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="e.g. AK Continental 3*"
                          value={activeOption.hotelName}
                          onChange={(e) => updateHotelOption(hotelIndex, activeOption.id, { hotelName: e.target.value })}
                          className="flex-1 min-w-0 bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                        />

                        {/* Option switcher if multi-options exist */}
                        {options.length > 1 && (
                          <select
                            value={selectedOptionId}
                            onChange={(e) => selectHotelOptionForCalculation(hotelIndex, e.target.value)}
                            className="bg-blue-50 border border-blue-300 rounded-md px-1.5 py-1 text-[11px] font-bold text-blue-900 cursor-pointer shadow-2xs max-w-[100px] shrink-0 truncate"
                            title="Switch active hotel option"
                          >
                            {options.map((opt, i) => (
                              <option key={opt.id} value={opt.id}>
                                Opt {i + 1} (₹{opt.doubleRate})
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Add Option button */}
                        <button
                          type="button"
                          onClick={() => addHotelOption(hotelIndex)}
                          className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold border border-slate-300 shrink-0 transition cursor-pointer shadow-2xs"
                          title="Add alternative hotel option"
                        >
                          +Opt
                        </button>
                      </div>
                    </td>

                    {/* Room Category */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Deluxe Room"
                        value={activeOption.roomCategory}
                        onChange={(e) => updateHotelOption(hotelIndex, activeOption.id, { roomCategory: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Meal Plan */}
                    <td className="py-2 px-1 text-center">
                      <select
                        value={activeOption.mealPlan}
                        onChange={(e) => updateHotelOption(hotelIndex, activeOption.id, { mealPlan: e.target.value as MealPlanType })}
                        className="w-full bg-white border border-slate-300 rounded-md px-1 py-1 text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      >
                        <option value="EP">EP</option>
                        <option value="CP">CP</option>
                        <option value="MAP">MAP</option>
                        <option value="AP">AP</option>
                      </select>
                    </td>

                    {/* Double Rate */}
                    <td className="py-2 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={activeOption.doubleRate ?? ''}
                        onChange={(e) => updateHotelOption(hotelIndex, activeOption.id, { doubleRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-full text-right bg-white border border-slate-300 rounded-md px-1.5 py-1 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Extra Bed Rate */}
                    <td className="py-2 px-1.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={activeOption.extraBedRate ?? ''}
                        onChange={(e) => updateHotelOption(hotelIndex, activeOption.id, { extraBedRate: parsePositiveNumber(e.target.value, 0) })}
                        className="w-full text-right bg-white border border-slate-300 rounded-md px-1.5 py-1 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="py-2 px-2 text-right font-black text-blue-700 font-brand text-xs whitespace-nowrap">
                      {formatINR(calc.totalCost)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => duplicateHotel(hotelIndex)}
                          title="Duplicate stay"
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHotel(hotelIndex)}
                          title="Delete stay"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
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
