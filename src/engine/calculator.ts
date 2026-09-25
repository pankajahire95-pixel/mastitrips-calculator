import {
  PackageData,
  HotelItem,
  VehicleItem,
  MealItem,
  ActivityItem,
  FlightTrainFareItem,
  OtherServiceItem,
  PaxDetails,
  PricingSettings,
  RoomAllocation,
  CalculatedHotelItem,
  CategorySummary,
  MasterCalculationResult,
  SmartWarning,
  RoundingOption
} from '../types';

/**
 * Calculate cost and capacity for a single hotel item using unified tour room allocation.
 * If multiple hotel options exist for this destination stay, uses the selected option for calculations.
 * Triple Rate = Double Rate + Extra Bed Rate
 * Quad Rate = Double Rate + (2 * Extra Bed Rate)
 */
export function calculateHotelItemCost(hotel: HotelItem, allocation: RoomAllocation): CalculatedHotelItem {
  const selectedOption = (hotel.options && hotel.options.length > 0)
    ? (hotel.options.find(o => o.id === hotel.selectedOptionId) || hotel.options[0])
    : undefined;

  const doubleRate = Math.max(0, (selectedOption ? selectedOption.doubleRate : hotel.doubleRate) || 0);
  const extraBedRate = Math.max(0, (selectedOption ? selectedOption.extraBedRate : hotel.extraBedRate) || 0);
  const nights = Math.max(0, hotel.nights || 0);
  
  const doubleRooms = Math.max(0, allocation?.doubleRooms || 0);
  const tripleRooms = Math.max(0, allocation?.tripleRooms || 0);
  const quadRooms = Math.max(0, allocation?.quadRooms || 0);

  const tripleRate = doubleRate + extraBedRate;
  const quadRate = doubleRate + (extraBedRate * 2);

  const doubleTotal = doubleRooms * doubleRate * nights;
  const tripleTotal = tripleRooms * tripleRate * nights;
  const quadTotal = quadRooms * quadRate * nights;

  const totalCost = doubleTotal + tripleTotal + quadTotal;
  const totalCapacity = (doubleRooms * 2) + (tripleRooms * 3) + (quadRooms * 4);

  const allOptions = (hotel.options && hotel.options.length > 0)
    ? hotel.options.map((opt) => {
        const dRate = Math.max(0, opt.doubleRate || 0);
        const exRate = Math.max(0, opt.extraBedRate || 0);
        const tRate = dRate + exRate;
        const qRate = dRate + (exRate * 2);
        const dTot = doubleRooms * dRate * nights;
        const tTot = tripleRooms * tRate * nights;
        const qTot = quadRooms * qRate * nights;
        return {
          option: opt,
          isSelected: selectedOption ? opt.id === selectedOption.id : false,
          tripleRate: tRate,
          quadRate: qRate,
          doubleTotal: dTot,
          tripleTotal: tTot,
          quadTotal: qTot,
          totalCost: dTot + tTot + qTot,
        };
      })
    : undefined;

  return {
    hotel,
    selectedOption,
    allOptions,
    tripleRate,
    quadRate,
    doubleTotal,
    tripleTotal,
    quadTotal,
    totalCost,
    totalCapacity,
  };
}

/**
 * Calculate total cost for all hotels using unified tour room allocation.
 */
export function calculateHotelsCost(hotels: HotelItem[], allocation: RoomAllocation): { totalCost: number; breakdowns: CalculatedHotelItem[] } {
  const breakdowns = (hotels || []).map((h) => calculateHotelItemCost(h, allocation));
  const totalCost = breakdowns.reduce((sum, item) => sum + item.totalCost, 0);
  return { totalCost, breakdowns };
}

/**
 * Calculate single vehicle cost.
 */
export function calculateVehicleItemCost(vehicle: VehicleItem): number {
  const count = Math.max(0, vehicle.numberOfVehicles || 0);
  const days = Math.max(0, vehicle.numberOfDays || 0);
  const rate = Math.max(0, vehicle.ratePerDay || 0);

  switch (vehicle.costingBasis) {
    case 'per_day':
      return count * days * rate;
    case 'per_trip':
      return count * rate;
    case 'fixed':
      return rate;
    default:
      return count * days * rate;
  }
}

/**
 * Calculate total vehicles cost.
 */
export function calculateVehiclesCost(vehicles: VehicleItem[]): number {
  return (vehicles || []).reduce((sum, v) => sum + calculateVehicleItemCost(v), 0);
}

/**
 * Calculate single meal cost.
 */
export function calculateMealItemCost(meal: MealItem, pax: PaxDetails): number {
  const mealsCount = Math.max(0, meal.numberOfMeals || 0);
  const adultRate = Math.max(0, meal.adultRate || 0);
  const adults = Math.max(0, pax.adults || 0);
  const children = Math.max(0, pax.children || 0);
  const infants = Math.max(0, pax.infants || 0);

  const hasCustomChildRate = meal.childRate !== null && meal.childRate !== undefined && !isNaN(Number(meal.childRate)) && Number(meal.childRate) >= 0;
  const childRate = hasCustomChildRate ? Number(meal.childRate) : (adultRate * (Math.max(0, pax.childPercentage || 70) / 100));

  const hasCustomInfantRate = meal.infantRate !== null && meal.infantRate !== undefined && !isNaN(Number(meal.infantRate)) && Number(meal.infantRate) >= 0;
  const infantRate = hasCustomInfantRate ? Number(meal.infantRate) : 0;

  const adultTotal = adults * adultRate * mealsCount;
  const childTotal = children * childRate * mealsCount;
  const infantTotal = infants * infantRate * mealsCount;

  return adultTotal + childTotal + infantTotal;
}

/**
 * Calculate total meals cost.
 */
export function calculateMealsCost(meals: MealItem[], pax: PaxDetails): number {
  return (meals || []).reduce((sum, m) => sum + calculateMealItemCost(m, pax), 0);
}

/**
 * Calculate single activity cost.
 */
export function calculateActivityItemCost(activity: ActivityItem, childPercentage: number = 70): number {
  const adultRate = Math.max(0, activity.adultRate || 0);
  const adultQty = Math.max(0, activity.adultQuantity || 0);
  const childQty = Math.max(0, activity.childQuantity || 0);
  const infantQty = Math.max(0, activity.infantQuantity || 0);

  const hasCustomChildRate = activity.childRate !== null && activity.childRate !== undefined && !isNaN(Number(activity.childRate)) && Number(activity.childRate) >= 0;
  const childRate = hasCustomChildRate ? Number(activity.childRate) : (adultRate * (Math.max(0, childPercentage) / 100));

  const hasCustomInfantRate = activity.infantRate !== null && activity.infantRate !== undefined && !isNaN(Number(activity.infantRate)) && Number(activity.infantRate) >= 0;
  const infantRate = hasCustomInfantRate ? Number(activity.infantRate) : 0;

  const adultTotal = adultQty * adultRate;
  const childTotal = childQty * childRate;
  const infantTotal = infantQty * infantRate;

  return adultTotal + childTotal + infantTotal;
}

/**
 * Calculate total activities cost.
 */
export function calculateActivitiesCost(activities: ActivityItem[], childPercentage: number = 70): number {
  return (activities || []).reduce((sum, a) => sum + calculateActivityItemCost(a, childPercentage), 0);
}

/**
 * Calculate per-person Flight / Train Fare item cost.
 */
export function calculateFlightTrainFareItemCost(item: FlightTrainFareItem, childPercentage: number = 70): number {
  const adultRate = Math.max(0, item.adultRate || 0);
  const adultQty = Math.max(0, item.adultQuantity || 0);
  const childQty = Math.max(0, item.childQuantity || 0);
  const infantQty = Math.max(0, item.infantQuantity || 0);

  const hasCustomChildRate = item.childRate !== null && item.childRate !== undefined && !isNaN(Number(item.childRate)) && Number(item.childRate) >= 0;
  const childRate = hasCustomChildRate ? Number(item.childRate) : (adultRate * (Math.max(0, childPercentage) / 100));

  const hasCustomInfantRate = item.infantRate !== null && item.infantRate !== undefined && !isNaN(Number(item.infantRate)) && Number(item.infantRate) >= 0;
  const infantRate = hasCustomInfantRate ? Number(item.infantRate) : 0;

  const adultTotal = adultQty * adultRate;
  const childTotal = childQty * childRate;
  const infantTotal = infantQty * infantRate;

  return adultTotal + childTotal + infantTotal;
}

/**
 * Calculate total flight & train fares cost.
 */
export function calculateFlightTrainFaresCost(items: FlightTrainFareItem[], childPercentage: number = 70): number {
  return (items || []).reduce((sum, f) => sum + calculateFlightTrainFareItemCost(f, childPercentage), 0);
}

/**
 * Calculate single other service cost.
 */
export function calculateOtherServiceItemCost(item: OtherServiceItem): number {
  const qty = Math.max(0, item.quantity || 0);
  const rate = Math.max(0, item.rate || 0);
  return qty * rate;
}

/**
 * Calculate total other services cost.
 */
export function calculateOtherServicesCost(items: OtherServiceItem[]): number {
  return (items || []).reduce((sum, o) => sum + calculateOtherServiceItemCost(o), 0);
}

/**
 * Helper to apply rounding option.
 */
export function roundPrice(value: number, rounding: RoundingOption): number {
  if (rounding === 'none' || !rounding) return Math.round(value);
  const step = parseInt(rounding, 10);
  if (isNaN(step) || step <= 0) return Math.round(value);
  return Math.round(value / step) * step;
}

/**
 * Master package calculation function.
 */
export function calculateMasterPackageCost(pkg: PackageData): MasterCalculationResult {
  const { pax, pricingSettings, roomAllocation } = pkg;
  const childPct = Math.max(0, pax.childPercentage ?? 70);
  const infantPct = Math.max(0, pax.infantPercentage ?? 0);

  const allocation: RoomAllocation = roomAllocation || { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 };

  // Category totals
  const hotelCalc = calculateHotelsCost(pkg.hotels || [], allocation);
  const vehiclesTotal = calculateVehiclesCost(pkg.vehicles || []);
  const mealsTotal = calculateMealsCost(pkg.meals || [], pax);
  const activitiesTotal = calculateActivitiesCost(pkg.activities || [], childPct);
  const flightTrainTotal = calculateFlightTrainFaresCost(pkg.flightTrainFares || [], childPct);
  const otherServicesTotal = calculateOtherServicesCost(pkg.otherServices || []);

  const categoryTotals: CategorySummary = {
    hotels: hotelCalc.totalCost,
    vehicles: vehiclesTotal,
    meals: mealsTotal,
    activities: activitiesTotal,
    flightTrainFares: flightTrainTotal,
    otherServices: otherServicesTotal,
  };

  const totalNetCost = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Pax counts
  const adults = Math.max(0, pax.adults || 0);
  const children = Math.max(0, pax.children || 0);
  const infants = Math.max(0, pax.infants || 0);
  const totalPax = adults + children + infants;
  const payingPax = adults + children;

  // Adult Equivalent
  const adultEquivalent = adults + (children * (childPct / 100)) + (infants * (infantPct / 100));

  // Net per Pax
  const adultCost = adultEquivalent > 0 ? totalNetCost / adultEquivalent : 0;
  const childCost = adultCost * (childPct / 100);
  const infantCost = infants > 0 ? adultCost * (infantPct / 100) : 0;
  const averageCostPerPax = totalPax > 0 ? totalNetCost / totalPax : 0;

  // Selling Price calculation
  const markupType = pricingSettings?.markupType || 'percentage';
  const markupVal = Math.max(0, pricingSettings?.markupValue || 0);

  let rawSellingPrice = totalNetCost;
  if (markupType === 'percentage') {
    const markupAmt = totalNetCost * (markupVal / 100);
    rawSellingPrice = totalNetCost + markupAmt;
  } else {
    rawSellingPrice = totalNetCost + markupVal;
  }

  const rounding = pricingSettings?.rounding || 'none';
  const sellingPrice = roundPrice(rawSellingPrice, rounding);
  const profit = sellingPrice - totalNetCost;

  const markupPercentage = totalNetCost > 0 ? (profit / totalNetCost) * 100 : 0;
  const marginPercentage = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  // Selling Price per Pax
  const adultSellingPrice = adultEquivalent > 0 ? (sellingPrice / adultEquivalent) : 0;
  const childSellingPrice = adultSellingPrice * (childPct / 100);
  const infantSellingPrice = infants > 0 ? (adultSellingPrice * (infantPct / 100)) : 0;

  return {
    categoryTotals,
    totalNetCost,
    totalPax,
    payingPax,
    adultEquivalent,
    adultCost,
    childCost,
    infantCost,
    averageCostPerPax,
    rawSellingPrice,
    sellingPrice,
    profit,
    markupPercentage,
    marginPercentage,
    adultSellingPrice,
    childSellingPrice,
    infantSellingPrice,
    hotelBreakdowns: hotelCalc.breakdowns,
  };
}

/**
 * Generate smart non-blocking warnings based on package configuration.
 */
export function generateSmartWarnings(pkg: PackageData): SmartWarning[] {
  const warnings: SmartWarning[] = [];
  const totalPax = (pkg.pax.adults || 0) + (pkg.pax.children || 0);
  const allocation = pkg.roomAllocation || { doubleRooms: 0, tripleRooms: 0, quadRooms: 0 };
  const totalCapacity = (allocation.doubleRooms * 2) + (allocation.tripleRooms * 3) + (allocation.quadRooms * 4);

  // 1. Hotel check
  if (!pkg.hotels || pkg.hotels.length === 0) {
    warnings.push({
      id: 'no-hotel',
      level: 'warning',
      module: 'hotels',
      title: 'No Hotel Added',
      message: 'No hotel accommodation has been added to this package.',
    });
  } else {
    const totalHotelNights = pkg.hotels.reduce((sum, h) => sum + (h.nights || 0), 0);
    if (pkg.packageDetails.nights > 0 && totalHotelNights !== pkg.packageDetails.nights) {
      warnings.push({
        id: 'hotel-nights-mismatch',
        level: 'warning',
        module: 'hotels',
        title: 'Hotel Nights Mismatch',
        message: `Total hotel nights (${totalHotelNights}N) does not match package nights (${pkg.packageDetails.nights}N).`,
      });
    }

    if (totalPax > 0 && totalCapacity < totalPax && (allocation.doubleRooms + allocation.tripleRooms + allocation.quadRooms) > 0) {
      warnings.push({
        id: 'hotel-capacity-tour',
        level: 'warning',
        module: 'hotels',
        title: 'Insufficient Tour Room Capacity',
        message: `Combined allocated rooms accommodate ${totalCapacity} pax, but tour has ${totalPax} paying pax (${pkg.pax.adults}A + ${pkg.pax.children}C).`,
      });
    }

    pkg.hotels.forEach((h, idx) => {
      const activeOpt = (h.options && h.options.length > 0)
        ? (h.options.find(o => o.id === h.selectedOptionId) || h.options[0])
        : undefined;
      const hotelLabel = activeOpt?.hotelName || h.hotelName || `Hotel #${idx + 1}`;
      const extraBedRate = activeOpt ? (activeOpt.extraBedRate || 0) : (h.extraBedRate || 0);

      if ((allocation.tripleRooms > 0 || allocation.quadRooms > 0) && extraBedRate <= 0) {
        warnings.push({
          id: `hotel-extrabed-${h.id}`,
          level: 'warning',
          module: 'hotels',
          title: `Extra Bed Rate Missing: ${hotelLabel}`,
          message: `Triple/Quad rooms are allocated for the tour, but Extra Bed Rate is ₹0 for ${hotelLabel}.`,
        });
      }
    });
  }

  // 2. Vehicle check
  if (!pkg.vehicles || pkg.vehicles.length === 0) {
    warnings.push({
      id: 'no-vehicle',
      level: 'info',
      module: 'vehicles',
      title: 'No Vehicle Added',
      message: 'No transport vehicle is assigned to this tour package.',
    });
  } else {
    const vehicleCapacities: Record<string, number> = {
      'Sedan': 4,
      'Ertiga': 6,
      'Innova': 6,
      'Innova Crysta': 7,
      'Tempo Traveller': 12,
      'Mini Bus': 22,
      'Bus': 45,
      'Custom Vehicle': 10,
    };

    const totalVehicleCapacity = pkg.vehicles.reduce((sum, v) => {
      const cap = vehicleCapacities[v.vehicleType] || 4;
      return sum + (cap * (v.numberOfVehicles || 1));
    }, 0);

    if (totalPax > 0 && totalVehicleCapacity < totalPax) {
      warnings.push({
        id: 'vehicle-capacity',
        level: 'warning',
        module: 'vehicles',
        title: 'Vehicle Capacity May Be Insufficient',
        message: `Total vehicle capacity (~${totalVehicleCapacity} seats) may be tight for ${totalPax} passengers.`,
      });
    }
  }

  // 3. Pax check
  if ((pkg.pax.adults || 0) === 0 && (pkg.pax.children || 0) === 0) {
    warnings.push({
      id: 'no-pax',
      level: 'warning',
      module: 'pax',
      title: 'Zero Passengers',
      message: 'Please enter at least 1 adult or child to calculate per-person rates accurately.',
    });
  }

  return warnings;
}

/**
 * Provide helpful room configuration suggestions based on Adults and Children.
 */
export function suggestRoomConfigurations(adults: number, children: number): { label: string; allocation: RoomAllocation }[] {
  const total = adults + children;
  if (total <= 0) return [];
  const list: { label: string; allocation: RoomAllocation }[] = [];

  if (total === 1) {
    list.push({ label: '1 Double Room (1 Pax)', allocation: { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 } });
  } else if (total === 2) {
    list.push({ label: '1 Double Room (2 Pax)', allocation: { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 } });
  } else if (total === 3) {
    list.push({ label: '1 Triple Room (3 Pax)', allocation: { doubleRooms: 0, tripleRooms: 1, quadRooms: 0 } });
    list.push({ label: '2 Double Rooms (4 Pax Cap)', allocation: { doubleRooms: 2, tripleRooms: 0, quadRooms: 0 } });
  } else if (total === 4) {
    list.push({ label: '2 Double Rooms (4 Pax)', allocation: { doubleRooms: 2, tripleRooms: 0, quadRooms: 0 } });
    list.push({ label: '1 Quad Room (4 Pax)', allocation: { doubleRooms: 0, tripleRooms: 0, quadRooms: 1 } });
  } else if (total === 5) {
    list.push({ label: '1 Double + 1 Triple Room (5 Pax)', allocation: { doubleRooms: 1, tripleRooms: 1, quadRooms: 0 } });
    list.push({ label: '1 Quad + 1 Double Room (6 Pax Cap)', allocation: { doubleRooms: 1, tripleRooms: 0, quadRooms: 1 } });
  } else if (total === 6) {
    list.push({ label: '3 Double Rooms (6 Pax)', allocation: { doubleRooms: 3, tripleRooms: 0, quadRooms: 0 } });
    list.push({ label: '2 Triple Rooms (6 Pax)', allocation: { doubleRooms: 0, tripleRooms: 2, quadRooms: 0 } });
    list.push({ label: '1 Quad + 1 Double Room (6 Pax)', allocation: { doubleRooms: 1, tripleRooms: 0, quadRooms: 1 } });
  } else {
    const doubles = Math.ceil(total / 2);
    const triples = Math.ceil(total / 3);
    list.push({ label: `${doubles} Double Rooms (${doubles * 2} Pax Cap)`, allocation: { doubleRooms: doubles, tripleRooms: 0, quadRooms: 0 } });
    if (total % 3 === 0) {
      list.push({ label: `${triples} Triple Rooms (${triples * 3} Pax)`, allocation: { doubleRooms: 0, tripleRooms: triples, quadRooms: 0 } });
    }
  }

  return list;
}
