import { describe, it, expect } from 'vitest';
import {
  calculateHotelItemCost,
  calculateHotelsCost,
  calculateVehicleItemCost,
  calculateFlightTrainFareItemCost,
  calculateMasterPackageCost,
} from './calculator';
import { HotelItem, PackageData, RoomAllocation } from '../types';

describe('Master Costing Engine - Hotel Calculations with Combined Tour Room Allocation', () => {
  it('Requirement 47: Critical Hotel Test 1 returns exactly ₹40,500 with Tour Allocation (2D, 1T, 0Q)', () => {
    const hotel: HotelItem = {
      id: 'test-h1',
      destination: 'Udaipur',
      hotelName: 'ABC Resort',
      roomCategory: 'Deluxe',
      mealPlan: 'CP',
      nights: 3,
      doubleRate: 4000,
      extraBedRate: 1500,
    };

    const allocation: RoomAllocation = {
      doubleRooms: 2,
      tripleRooms: 1,
      quadRooms: 0,
    };

    const res = calculateHotelItemCost(hotel, allocation);
    expect(res.doubleTotal).toBe(24000);
    expect(res.tripleTotal).toBe(16500);
    expect(res.quadTotal).toBe(0);
    expect(res.tripleRate).toBe(5500);
    expect(res.quadRate).toBe(7000);
    expect(res.totalCost).toBe(40500);
    expect(res.totalCapacity).toBe(7);
  });

  it('Requirement 48: Critical Hotel Test 2 returns exactly ₹21,000 with Tour Allocation (0D, 0T, 1Q)', () => {
    const hotel: HotelItem = {
      id: 'test-h2',
      destination: 'Jaipur',
      hotelName: 'Heritage Haveli',
      roomCategory: 'Family Suite',
      mealPlan: 'MAP',
      nights: 3,
      doubleRate: 4000,
      extraBedRate: 1500,
    };

    const allocation: RoomAllocation = {
      doubleRooms: 0,
      tripleRooms: 0,
      quadRooms: 1,
    };

    const res = calculateHotelItemCost(hotel, allocation);
    expect(res.quadRate).toBe(7000);
    expect(res.quadTotal).toBe(21000);
    expect(res.totalCost).toBe(21000);
  });
});

describe('Master Costing Engine - Full Package with Combined Tour Room Allocation', () => {
  const basePackage: PackageData = {
    id: 'pkg-test-combined',
    packageDetails: {
      id: 'pkg-test-combined',
      packageName: 'Rajasthan Family Tour',
      destination: 'Rajasthan',
      travelDate: '2026-11-15',
      days: 6,
      nights: 5,
      createdAt: '2026-08-21T00:00:00.000Z',
      updatedAt: '2026-08-21T00:00:00.000Z',
    },
    pax: {
      adults: 4,
      children: 2,
      infants: 0,
      childPercentage: 70,
      infantPercentage: 0,
    },
    roomAllocation: {
      doubleRooms: 1,
      tripleRooms: 1,
      quadRooms: 0,
    },
    hotels: [
      {
        id: 'h1',
        destination: 'Udaipur',
        hotelName: 'Hotel 1',
        roomCategory: 'Deluxe',
        mealPlan: 'CP',
        nights: 2,
        doubleRate: 4000,
        extraBedRate: 1500, // Triple: 5500 -> (1*4000*2) + (1*5500*2) = 8000 + 11000 = 19000
      },
      {
        id: 'h2',
        destination: 'Jaipur',
        hotelName: 'Hotel 2',
        roomCategory: 'Deluxe',
        mealPlan: 'MAP',
        nights: 3,
        doubleRate: 5000,
        extraBedRate: 1500, // Triple: 6500 -> (1*5000*3) + (1*6500*3) = 15000 + 19500 = 34500
      },
    ],
    vehicles: [
      {
        id: 'v1',
        vehicleType: 'Innova Crysta',
        vehicleName: 'Innova',
        numberOfVehicles: 1,
        numberOfDays: 5,
        ratePerDay: 4000,
        costingBasis: 'per_day',
      }, // 20,000
    ],
    meals: [],
    activities: [],
    flightTrainFares: [],
    otherServices: [],
    pricingSettings: {
      markupType: 'percentage',
      markupValue: 15,
      rounding: 'none',
    },
  };

  it('calculates Hotels total using the single tour room allocation across both hotels', () => {
    // Hotel 1 = 19,000. Hotel 2 = 34,500. Total Hotels = 53,500.
    // Vehicles = 20,000. Total Net = 73,500.
    const result = calculateMasterPackageCost(basePackage);
    expect(result.categoryTotals.hotels).toBe(53500);
    expect(result.totalNetCost).toBe(73500);
    expect(result.adultEquivalent).toBe(5.4);
    expect(result.adultCost).toBeCloseTo(73500 / 5.4, 2);
  });

  it('correctly calculates and switches hotel when multiple hotel options are fed for the same destination', () => {
    const multiOptionHotel: HotelItem = {
      id: 'h-multi',
      destination: 'Udaipur',
      hotelName: 'Radisson Blu',
      roomCategory: 'Deluxe',
      mealPlan: 'CP',
      nights: 2,
      doubleRate: 4000,
      extraBedRate: 1500,
      selectedOptionId: 'opt-budget',
      options: [
        {
          id: 'opt-deluxe',
          hotelName: 'Radisson Blu',
          roomCategory: 'Deluxe',
          mealPlan: 'CP',
          doubleRate: 4000,
          extraBedRate: 1500,
        },
        {
          id: 'opt-budget',
          hotelName: 'Heritage Haveli',
          roomCategory: 'Standard',
          mealPlan: 'CP',
          doubleRate: 2500,
          extraBedRate: 1000,
        },
        {
          id: 'opt-luxury',
          hotelName: 'Taj Lake Palace',
          roomCategory: 'Palace Room',
          mealPlan: 'CP',
          doubleRate: 12000,
          extraBedRate: 3000,
        },
      ],
    };

    const allocation: RoomAllocation = {
      doubleRooms: 1,
      tripleRooms: 1,
      quadRooms: 0,
    };

    // With 'opt-budget' selected:
    // Double = 1 * 2500 * 2 = 5000
    // Triple = 1 * (2500 + 1000) * 2 = 7000
    // Total = 12000
    const budgetRes = calculateHotelItemCost(multiOptionHotel, allocation);
    expect(budgetRes.totalCost).toBe(12000);
    expect(budgetRes.selectedOption?.hotelName).toBe('Heritage Haveli');

    // Switch selection to 'opt-luxury':
    // Double = 1 * 12000 * 2 = 24000
    // Triple = 1 * (12000 + 3000) * 2 = 30000
    // Total = 54000
    const luxuryHotel: HotelItem = {
      ...multiOptionHotel,
      selectedOptionId: 'opt-luxury',
    };
    const luxuryRes = calculateHotelItemCost(luxuryHotel, allocation);
    expect(luxuryRes.totalCost).toBe(54000);
    expect(luxuryRes.selectedOption?.hotelName).toBe('Taj Lake Palace');
  });
});
