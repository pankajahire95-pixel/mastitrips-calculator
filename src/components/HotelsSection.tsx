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
  AlertCircle, 
  Sparkles,
  Layers,
  Users,
  ShieldAlert,
  Star,
  Check,
  ArrowRightLeft,
  SlidersHorizontal,
  ChevronDown,
  Info
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
  onOpenAuditModal,
}) => {
  // Local state for which option tab is currently active for editing in each hotel card
  const [viewingTabByHotel, setViewingTabByHotel] = useState<Record<string, string>>({});

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
    };

    setViewingTabByHotel(prev => ({ ...prev, [hotel.id]: newOptId }));
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

    setViewingTabByHotel(prev => ({ ...prev, [hotel.id]: chosen.id }));

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

  const duplicateHotelOption = (hotelIndex: number, optionId: string) => {
    const hotel = hotels[hotelIndex];
    const { normalized, options } = ensureHotelWithOptions(hotel);
    const target = options.find(o => o.id === optionId);
    if (!target) return;

    const newOptId = generateUniqueId('opt');
    const copy: HotelOption = {
      ...target,
      id: newOptId,
      hotelName: target.hotelName ? `${target.hotelName} (Alternative)` : 'Alternative Hotel',
    };

    const index = options.findIndex(o => o.id === optionId);
    const nextOptions = [...options];
    nextOptions.splice(index + 1, 0, copy);

    const updatedHotel: HotelItem = {
      ...normalized,
      options: nextOptions,
    };

    setViewingTabByHotel(prev => ({ ...prev, [hotel.id]: newOptId }));

    const next = [...hotels];
    next[hotelIndex] = updatedHotel;
    onChangeHotels(next);
  };

  const deleteHotelOption = (hotelIndex: number, optionId: string) => {
    const hotel = hotels[hotelIndex];
    const { normalized, options, selectedOptionId } = ensureHotelWithOptions(hotel);
    if (options.length <= 1) return;

    const nextOptions = options.filter(o => o.id !== optionId);
    const newSelectedId = selectedOptionId === optionId ? nextOptions[0].id : selectedOptionId;
    const activeOpt = nextOptions.find(o => o.id === newSelectedId) || nextOptions[0];

    const updatedHotel: HotelItem = {
      ...normalized,
      options: nextOptions,
      selectedOptionId: newSelectedId,
      hotelName: activeOpt.hotelName,
      roomCategory: activeOpt.roomCategory,
      mealPlan: activeOpt.mealPlan,
      doubleRate: activeOpt.doubleRate,
      extraBedRate: activeOpt.extraBedRate,
      supplier: activeOpt.supplier,
      notes: activeOpt.notes,
    };

    setViewingTabByHotel(prev => ({ ...prev, [hotel.id]: newSelectedId }));

    const next = [...hotels];
    next[hotelIndex] = updatedHotel;
    onChangeHotels(next);
  };

  const duplicateHotel = (index: number) => {
    const target = hotels[index];
    const { normalized, options } = ensureHotelWithOptions(target);

    // Deep clone options with new IDs
    const clonedOptions = options.map(opt => ({
      ...opt,
      id: generateUniqueId('opt'),
    }));

    const copy: HotelItem = {
      ...normalized,
      id: generateUniqueId('hotel'),
      destination: normalized.destination ? `${normalized.destination} (Copy)` : '',
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
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition hover:shadow-md hover:border-slate-300">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs ring-1 ring-blue-100">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 font-brand">
                3. Hotels & Accommodations
              </h2>
              <span className="px-3 py-0.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-200">
                {hotels.length} {hotels.length === 1 ? 'Stay' : 'Stays'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Feed multiple hotels per destination &amp; switch the active hotel for calculation anytime
            </p>
          </div>
        </div>

        {/* Action & Subtotal */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Active Hotels Net</div>
            <div className="text-lg font-black text-blue-700 font-brand">
              {formatINR(totalHotelCost)}
            </div>
          </div>

          <button
            type="button"
            onClick={addHotel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition cursor-pointer active:scale-95 ring-1 ring-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination Stay</span>
          </button>
        </div>
      </div>

      {/* 1. MASTER TOUR ROOM ALLOCATION (Command Center Banner) */}
      <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-brand">
                Combined Tour Room Allocation
              </h3>
              <p className="text-xs text-slate-500">
                This room distribution setup applies automatically to all active destination hotels in this tour
              </p>
            </div>
          </div>

          {/* Capacity Status Badge */}
          <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-2xs ${
            isTourCapacitySufficient
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {isTourCapacitySufficient ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            )}
            <span>Room Capacity: <strong>{totalAllocatedCapacity} Pax</strong></span>
            {totalPayingPax > 0 && <span className="font-semibold text-xs text-slate-600">({totalPayingPax} Required)</span>}
          </span>
        </div>

        {/* 3 Room Sharing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          
          {/* Double Rooms Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-300 transition">
            <div>
              <div className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-blue-600" />
                <span>Double Sharing</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">
                2 Persons / Room • <span className="text-blue-700 font-bold">{(roomAllocation.doubleRooms || 0) * 2} Pax</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={roomAllocation.doubleRooms ?? ''}
                onChange={(e) => onUpdateRoomAllocation({
                  ...roomAllocation,
                  doubleRooms: parsePositiveNumber(e.target.value, 0),
                })}
                className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-base font-black text-center text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <span className="text-xs font-bold text-slate-400">Rms</span>
            </div>
          </div>

          {/* Triple Rooms Card */}
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-400 transition">
            <div>
              <div className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Triple Sharing</span>
              </div>
              <div className="text-xs text-blue-800/80 font-semibold mt-1">
                3 Persons (1 Dbl + 1 Ex Bed) • <span className="text-blue-900 font-bold">{(roomAllocation.tripleRooms || 0) * 3} Pax</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={roomAllocation.tripleRooms ?? ''}
                onChange={(e) => onUpdateRoomAllocation({
                  ...roomAllocation,
                  tripleRooms: parsePositiveNumber(e.target.value, 0),
                })}
                className="w-16 bg-blue-50/50 border border-blue-300 rounded-lg px-2 py-2 text-base font-black text-center text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <span className="text-xs font-bold text-blue-400">Rms</span>
            </div>
          </div>

          {/* Quad Rooms Card */}
          <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-400 transition">
            <div>
              <div className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Quad Sharing</span>
              </div>
              <div className="text-xs text-indigo-800/80 font-semibold mt-1">
                4 Persons (1 Dbl + 2 Ex Beds) • <span className="text-indigo-900 font-bold">{(roomAllocation.quadRooms || 0) * 4} Pax</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={roomAllocation.quadRooms ?? ''}
                onChange={(e) => onUpdateRoomAllocation({
                  ...roomAllocation,
                  quadRooms: parsePositiveNumber(e.target.value, 0),
                })}
                className="w-16 bg-indigo-50/50 border border-indigo-300 rounded-lg px-2 py-2 text-base font-black text-center text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <span className="text-xs font-bold text-indigo-400">Rms</span>
            </div>
          </div>

        </div>

        {/* 1-Click Smart Suggestion Chips */}
        {roomSuggestions.length > 0 && totalPayingPax > 0 && (
          <div className="mt-4 pt-3.5 border-t border-blue-200/70 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              1-Click Setup for {totalPayingPax} Pax:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {roomSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onUpdateRoomAllocation(sug.allocation)}
                  className="px-3.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold text-blue-900 shadow-2xs transition cursor-pointer active:scale-95"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. HOTEL CARDS LIST */}
      {hotels.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No destination stays added to this package</p>
          <p className="text-xs text-slate-400 mb-3">Add destination hotel stays and feed multiple hotel options</p>
          <button
            type="button"
            onClick={addHotel}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition cursor-pointer shadow-sm"
          >
            + Add First Destination Stay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {hotels.map((rawHotel, hotelIndex) => {
            const { normalized, options, selectedOptionId } = ensureHotelWithOptions(rawHotel);
            const calc = calculateHotelItemCost(normalized, roomAllocation);

            // Determine which option tab is currently open for viewing/editing
            const currentTabId = (viewingTabByHotel[normalized.id] && options.some(o => o.id === viewingTabByHotel[normalized.id]))
              ? viewingTabByHotel[normalized.id]
              : selectedOptionId;

            const currentOption = options.find(o => o.id === currentTabId) || options[0];
            const currentOptionIndex = options.findIndex(o => o.id === currentTabId);
            const isCurrentOptionSelectedForCalc = currentOption.id === selectedOptionId;

            // Selected Option details for header preview
            const selectedOption = options.find(o => o.id === selectedOptionId) || options[0];

            return (
              <div
                key={normalized.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition hover:border-slate-300 hover:shadow-sm"
              >
                {/* Hotel Card Top Header */}
                <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-2xs">
                      #{hotelIndex + 1}
                    </span>
                    <span className="text-sm font-black text-slate-900 font-brand">
                      {normalized.destination || `Destination #${hotelIndex + 1}`}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-200/80 text-slate-800 text-xs font-bold rounded-lg">
                      {normalized.nights} {normalized.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                    {options.length > 1 && (
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
                        {options.length} Hotel Options Fed
                      </span>
                    )}
                    {selectedOption.hotelName && (
                      <span className="text-xs font-bold text-slate-600 hidden md:inline">
                        • Active Hotel: <strong className="text-blue-900">{selectedOption.hotelName}</strong>
                      </span>
                    )}
                  </div>

                  {/* Actions & Subtotal Badge */}
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1 bg-blue-50 border border-blue-200 rounded-xl text-xs font-extrabold text-blue-900 flex items-center gap-2">
                      <span>Active Hotel Subtotal:</span>
                      <span className="font-black text-blue-700 font-brand text-sm">{formatINR(calc.totalCost)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => duplicateHotel(hotelIndex)}
                      title="Duplicate this destination stay"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteHotel(hotelIndex)}
                      title="Delete this destination stay"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hotel Card Body */}
                <div className="p-5 space-y-5 text-xs">
                  
                  {/* Row 1: Destination Stay Parameters (City & Nights) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/70">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Destination <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Udaipur / Jaipur / Goa"
                        value={normalized.destination}
                        onChange={(e) => updateDestinationFields(hotelIndex, { destination: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                        Stay Duration (Nights) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={normalized.nights || ''}
                        onChange={(e) => updateDestinationFields(hotelIndex, { nights: parsePositiveNumber(e.target.value, 1) })}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2 text-xs font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 2: MULTI-HOTEL SELECTION SWITCH & FEED CONTROL CENTER */}
                  <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border-2 border-blue-200 rounded-2xl space-y-3.5 shadow-2xs">
                    
                    {/* Top Switcher Bar with Select Box */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-blue-200/80">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                            <span>Hotel Selection Switch</span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md">
                              {options.length} {options.length === 1 ? 'Option' : 'Options'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Choose which hotel option to use for package costing calculation
                          </p>
                        </div>
                      </div>

                      {/* SELECT BOX FOR CALCULATION */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 whitespace-nowrap hidden sm:inline">
                          Active for Calculation:
                        </label>
                        <div className="relative min-w-[260px] sm:min-w-[300px]">
                          <select
                            value={selectedOptionId}
                            onChange={(e) => selectHotelOptionForCalculation(hotelIndex, e.target.value)}
                            className="w-full appearance-none bg-white border-2 border-blue-500 hover:border-blue-600 text-blue-950 font-black text-xs rounded-xl pl-3 pr-8 py-2 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          >
                            {options.map((opt, i) => {
                              const isSelected = opt.id === selectedOptionId;
                              const optLabel = opt.hotelName ? opt.hotelName : `Hotel Option #${i + 1}`;
                              const optRate = opt.doubleRate ? `₹${opt.doubleRate}/N` : '₹0/N';
                              return (
                                <option key={opt.id} value={opt.id}>
                                  {isSelected ? '★ [ACTIVE] ' : ''}Option #{i + 1}: {optLabel} ({opt.mealPlan}) — {optRate}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="w-4 h-4 text-blue-600 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Option Tabs Navigation Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {options.map((opt, i) => {
                          const isViewing = opt.id === currentTabId;
                          const isCalcSelected = opt.id === selectedOptionId;
                          const label = opt.hotelName ? opt.hotelName : `Option #${i + 1}`;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setViewingTabByHotel(prev => ({ ...prev, [normalized.id]: opt.id }))}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs border ${
                                isViewing
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-400/30'
                                  : isCalcSelected
                                  ? 'bg-white text-blue-900 border-blue-300 hover:bg-blue-50'
                                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900'
                              }`}
                            >
                              {isCalcSelected ? (
                                <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-black ${isViewing ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`} title="Active in calculation">
                                  ★
                                </span>
                              ) : (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isViewing ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  #{i + 1}
                                </span>
                              )}
                              <span>{label}</span>
                              <span className={`text-[10px] font-semibold ${isViewing ? 'text-blue-100' : 'text-slate-400'}`}>
                                (₹{opt.doubleRate || 0})
                              </span>
                            </button>
                          );
                        })}

                        {/* Add Hotel Option Button */}
                        <button
                          type="button"
                          onClick={() => addHotelOption(hotelIndex)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-dashed border-blue-300 hover:border-blue-500 rounded-xl text-xs font-extrabold shadow-2xs transition cursor-pointer active:scale-95"
                          title="Feed another hotel option for this destination"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Alternative Hotel</span>
                        </button>
                      </div>

                      {/* Option Tab Status & Actions */}
                      <div className="flex items-center gap-2">
                        {!isCurrentOptionSelectedForCalc ? (
                          <button
                            type="button"
                            onClick={() => selectHotelOptionForCalculation(hotelIndex, currentOption.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 ring-1 ring-emerald-400/40"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Select for Calculation</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selected for Calculation</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => duplicateHotelOption(hotelIndex, currentOption.id)}
                          title="Duplicate this hotel option"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteHotelOption(hotelIndex, currentOption.id)}
                            title="Delete this hotel option"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Row 3: INPUTS FOR CURRENT VIEWING HOTEL OPTION */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                          Editing Option #{currentOptionIndex + 1}:
                        </span>
                        <span className="text-xs font-bold text-blue-700">
                          {currentOption.hotelName || 'New Hotel Option'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Rates apply for {normalized.nights} {normalized.nights === 1 ? 'Night' : 'Nights'} in {normalized.destination || 'Destination'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
                      {/* Hotel Name */}
                      <div className="lg:col-span-5">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Hotel Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Radisson Blu / Heritage Haveli"
                          value={currentOption.hotelName}
                          onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { hotelName: e.target.value })}
                          className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      {/* Room Category */}
                      <div className="lg:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Room Category
                        </label>
                        <input
                          type="text"
                          placeholder="Deluxe Room"
                          value={currentOption.roomCategory}
                          onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { roomCategory: e.target.value })}
                          className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      {/* Meal Plan */}
                      <div className="lg:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Meal Plan
                        </label>
                        <select
                          value={currentOption.mealPlan}
                          onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { mealPlan: e.target.value as MealPlanType })}
                          className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        >
                          <option value="EP">EP (Room Only)</option>
                          <option value="CP">CP (Breakfast)</option>
                          <option value="MAP">MAP (Breakfast + Dinner)</option>
                          <option value="AP">AP (All Meals)</option>
                          <option value="Custom">Custom Plan</option>
                        </select>
                      </div>
                    </div>

                    {/* Base Rates & Auto-Derivations */}
                    <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        {/* Double Sharing Rate Input */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Double Rate / Night (₹) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="3500"
                              value={currentOption.doubleRate || ''}
                              onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { doubleRate: parsePositiveNumber(e.target.value, 0) })}
                              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Extra Bed Rate Input */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Extra Bed Rate / Night (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="1200"
                              value={currentOption.extraBedRate || ''}
                              onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { extraBedRate: parsePositiveNumber(e.target.value, 0) })}
                              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Auto Derived Room Rates Display for this Option */}
                        <div className="md:col-span-6 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                            <span>Derived Rates for {currentOption.hotelName || `Option #${currentOptionIndex + 1}`}</span>
                            <span className="text-emerald-700 font-bold text-[10px]">✓ Formula Applied</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2.5 text-center">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-600">DOUBLE</div>
                              <div className="text-sm font-black text-slate-900">{formatINR(currentOption.doubleRate || 0)}</div>
                              <div className="text-[9px] text-slate-400 font-semibold">2 Pax Base</div>
                            </div>

                            <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                              <div className="text-[10px] font-bold text-blue-800">TRIPLE</div>
                              <div className="text-sm font-black text-blue-950">
                                {formatINR((currentOption.doubleRate || 0) + (currentOption.extraBedRate || 0))}
                              </div>
                              <div className="text-[9px] text-blue-700 font-semibold">Dbl + Ex Bed</div>
                            </div>

                            <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                              <div className="text-[10px] font-bold text-indigo-800">QUAD</div>
                              <div className="text-sm font-black text-indigo-950">
                                {formatINR((currentOption.doubleRate || 0) + ((currentOption.extraBedRate || 0) * 2))}
                              </div>
                              <div className="text-[9px] text-indigo-700 font-semibold">Dbl + 2 Ex Beds</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Supplier & Notes (Collapsible or Compact) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Supplier / DMC Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rajasthan Royal Holidays"
                          value={currentOption.supplier || ''}
                          onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { supplier: e.target.value })}
                          className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Inclusions / Notes (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Includes welcome drinks & high tea"
                          value={currentOption.notes || ''}
                          onChange={(e) => updateHotelOption(hotelIndex, currentOption.id, { notes: e.target.value })}
                          className="w-full bg-slate-50/70 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: MULTI-OPTION QUICK COMPARISON STRIP (If 2+ options fed) */}
                  {options.length > 1 && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                          Hotel Options Comparison for {normalized.destination || 'this location'} ({normalized.nights}N)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Click <strong>Select</strong> on any option to switch active hotel in quote
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {options.map((opt, i) => {
                          const isSel = opt.id === selectedOptionId;
                          const optDoubleRate = opt.doubleRate || 0;
                          const optExBed = opt.extraBedRate || 0;
                          const optTripleRate = optDoubleRate + optExBed;
                          const optQuadRate = optDoubleRate + (optExBed * 2);
                          const optTotalCost = 
                            ((roomAllocation.doubleRooms || 0) * optDoubleRate * (normalized.nights || 1)) +
                            ((roomAllocation.tripleRooms || 0) * optTripleRate * (normalized.nights || 1)) +
                            ((roomAllocation.quadRooms || 0) * optQuadRate * (normalized.nights || 1));

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                                isSel
                                  ? 'bg-blue-50/90 border-blue-300 shadow-xs ring-1 ring-blue-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-extrabold text-slate-900 text-xs truncate">
                                    #{i + 1} {opt.hotelName || 'Unnamed Hotel'}
                                  </span>
                                  {isSel ? (
                                    <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                      ACTIVE
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {opt.mealPlan}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {opt.roomCategory || 'Deluxe'} • ₹{optDoubleRate}/N
                                </div>
                                <div className="mt-2 text-sm font-black text-slate-900 font-brand">
                                  Total: {formatINR(optTotalCost)}
                                </div>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setViewingTabByHotel(prev => ({ ...prev, [normalized.id]: opt.id }))}
                                  className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                                >
                                  Edit Details
                                </button>

                                {!isSel ? (
                                  <button
                                    type="button"
                                    onClick={() => selectHotelOptionForCalculation(hotelIndex, opt.id)}
                                    className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-800 border border-blue-300 rounded-lg text-[11px] font-extrabold transition cursor-pointer"
                                  >
                                    Use in Calculation
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> In Calculation
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Row 5: ACTIVE HOTEL CALCULATION BREAKDOWN TABLE */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-100/90 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Active Hotel Calculation Table ({selectedOption.hotelName || `Option #${options.findIndex(o => o.id === selectedOptionId) + 1}`} — {selectedOption.mealPlan})
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        Applied to Tour Quote
                      </span>
                    </div>

                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">Room Sharing</th>
                          <th className="py-2.5 px-3 text-center">Tour Allocation</th>
                          <th className="py-2.5 px-3.5 text-right">Rate / Room / Night</th>
                          <th className="py-2.5 px-3 text-center">Nights</th>
                          <th className="py-2.5 px-3.5 text-right">Calculation Formula</th>
                          <th className="py-2.5 px-3.5 text-right">Room Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3.5 font-bold text-slate-800">Double Room (2 Pax)</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-slate-900 bg-slate-50/50">
                            {roomAllocation.doubleRooms || 0} Rooms
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-semibold text-slate-700">{formatINR(selectedOption.doubleRate || 0)}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{normalized.nights}N</td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-xs text-slate-400">
                            {roomAllocation.doubleRooms || 0} × {formatINR(selectedOption.doubleRate || 0)} × {normalized.nights}N
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-black text-slate-900 font-brand text-sm">{formatINR(calc.doubleTotal)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3.5 font-bold text-blue-900">Triple Room (3 Pax)</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-blue-900 bg-blue-50/30">
                            {roomAllocation.tripleRooms || 0} Rooms
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-semibold text-blue-900">{formatINR(calc.tripleRate)}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{normalized.nights}N</td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-xs text-blue-600/70">
                            {roomAllocation.tripleRooms || 0} × {formatINR(calc.tripleRate)} × {normalized.nights}N
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-black text-blue-900 font-brand text-sm">{formatINR(calc.tripleTotal)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3.5 font-bold text-indigo-900">Quad Room (4 Pax)</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-indigo-900 bg-indigo-50/30">
                            {roomAllocation.quadRooms || 0} Rooms
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-semibold text-indigo-900">{formatINR(calc.quadRate)}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{normalized.nights}N</td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-xs text-indigo-600/70">
                            {roomAllocation.quadRooms || 0} × {formatINR(calc.quadRate)} × {normalized.nights}N
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-black text-indigo-900 font-brand text-sm">{formatINR(calc.quadTotal)}</td>
                        </tr>
                      </tbody>

                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={5} className="py-3 px-3.5 text-right uppercase text-slate-700 text-xs">
                            Active Hotel Total ({normalized.nights}N):
                          </td>
                          <td className="py-3 px-3.5 text-right text-base font-black text-blue-700 font-brand">
                            {formatINR(calc.totalCost)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Add button & Total */}
      {hotels.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={addHotel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination Stay</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            Total Hotel Nights: <strong className="text-slate-900">{totalHotelNights}N</strong> {packageNights > 0 && `(Package: ${packageNights}N)`}
          </span>
        </div>
      )}
    </section>
  );
};
