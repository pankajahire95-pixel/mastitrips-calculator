export type MealPlanType = 'EP' | 'CP' | 'MAP' | 'AP' | 'Custom';

export type VehicleType = 
  | 'Sedan' 
  | 'Ertiga' 
  | 'Innova' 
  | 'Innova Crysta' 
  | 'Tempo Traveller' 
  | 'Mini Bus' 
  | 'Bus' 
  | 'Custom Vehicle';

export type VehicleCostingBasis = 'per_day' | 'per_trip' | 'fixed';

export type MealType = 
  | 'Breakfast' 
  | 'Lunch' 
  | 'Dinner' 
  | 'Special Dinner' 
  | 'Buffet' 
  | 'Jain Meal' 
  | 'Other';

export type FareTransportType = 
  | 'Flight' 
  | 'Train (1st AC)' 
  | 'Train (2nd AC)' 
  | 'Train (3rd AC)' 
  | 'Train (Chair Car CC)' 
  | 'Train (Sleeper SL)' 
  | 'Volvo / AC Bus' 
  | 'Other Transit';

export type MarkupType = 'percentage' | 'fixed';

export type RoundingOption = 'none' | '100' | '500' | '1000' | '5000';

export interface PackageDetails {
  id: string;
  packageName: string;
  destination: string;
  travelDate: string;
  days: number;
  nights: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaxDetails {
  adults: number;
  children: number;
  infants: number;
  childPercentage: number; // default 70%
  infantPercentage: number; // default 0%
}

export interface RoomAllocation {
  doubleRooms: number;
  tripleRooms: number;
  quadRooms: number;
}

export interface HotelOption {
  id: string;
  hotelName: string;
  roomCategory: string;
  mealPlan: MealPlanType;
  doubleRate: number;
  extraBedRate: number;
  supplier?: string;
  notes?: string;
}

export interface HotelItem {
  id: string;
  destination: string;
  hotelName: string;
  roomCategory: string;
  mealPlan: MealPlanType;
  nights: number;
  doubleRate: number;
  extraBedRate: number;
  supplier?: string;
  notes?: string;
  childrenWithoutBed?: number;
  childrenWithExtraBed?: number;
  options?: HotelOption[];
  selectedOptionId?: string;
}

export interface VehicleItem {
  id: string;
  vehicleType: VehicleType;
  vehicleName: string;
  numberOfVehicles: number;
  numberOfDays: number;
  ratePerDay: number;
  costingBasis: VehicleCostingBasis;
}

export interface MealItem {
  id: string;
  mealName: string;
  mealType: MealType;
  numberOfMeals: number;
  adultRate: number;
  childRate: number | null;
  infantRate: number | null;
}

export interface ActivityItem {
  id: string;
  activityName: string;
  destination: string;
  adultRate: number;
  childRate: number | null;
  infantRate: number | null;
  adultQuantity: number;
  childQuantity: number;
  infantQuantity: number;
}

export interface FlightTrainFareItem {
  id: string;
  transportType: FareTransportType;
  sector: string;
  flightOrTrainNumber?: string;
  adultRate: number;
  childRate: number | null;
  infantRate: number | null;
  adultQuantity: number;
  childQuantity: number;
  infantQuantity: number;
  notes?: string;
}

export interface OtherServiceItem {
  id: string;
  serviceName: string;
  quantity: number;
  rate: number;
  notes?: string;
}

export interface PricingSettings {
  markupType: MarkupType;
  markupValue: number;
  rounding: RoundingOption;
  adultSellingPriceOverride?: number | null;
  childSellingPriceOverride?: number | null;
}

export interface PackageData {
  id: string;
  packageDetails: PackageDetails;
  pax: PaxDetails;
  roomAllocation: RoomAllocation; // Unified tour room allocation for all hotels
  hotels: HotelItem[];
  vehicles: VehicleItem[];
  meals: MealItem[];
  activities: ActivityItem[];
  flightTrainFares: FlightTrainFareItem[];
  otherServices: OtherServiceItem[];
  pricingSettings: PricingSettings;
}

export interface CalculatedHotelOptionCost {
  option: HotelOption;
  isSelected: boolean;
  tripleRate: number;
  quadRate: number;
  doubleTotal: number;
  tripleTotal: number;
  quadTotal: number;
  totalCost: number;
}

export interface CalculatedHotelItem {
  hotel: HotelItem;
  selectedOption?: HotelOption;
  allOptions?: CalculatedHotelOptionCost[];
  tripleRate: number;
  quadRate: number;
  doubleTotal: number;
  tripleTotal: number;
  quadTotal: number;
  totalCost: number;
  totalCapacity: number;
}

export interface CategorySummary {
  hotels: number;
  vehicles: number;
  meals: number;
  activities: number;
  flightTrainFares: number;
  otherServices: number;
}

export interface MasterCalculationResult {
  categoryTotals: CategorySummary;
  totalNetCost: number;
  
  // Pax statistics
  totalPax: number;
  payingPax: number;
  adultEquivalent: number;
  
  // Net per pax
  adultCost: number;
  childCost: number;
  infantCost: number;
  averageCostPerPax: number;
  
  // Selling & Profit
  rawSellingPrice: number;
  sellingPrice: number;
  profit: number;
  markupPercentage: number;
  marginPercentage: number;
  
  // Selling per pax
  adultSellingPrice: number;
  childSellingPrice: number;
  infantSellingPrice: number;
  
  // Calculated Sub-details
  hotelBreakdowns: CalculatedHotelItem[];
}

export interface SmartWarning {
  id: string;
  level: 'warning' | 'info';
  title: string;
  message: string;
  module: 'hotels' | 'vehicles' | 'pax' | 'pricing' | 'package';
}
