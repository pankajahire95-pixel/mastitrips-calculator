import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PackageData, PricingSettings, RoomAllocation } from './types';
import { calculateMasterPackageCost, generateSmartWarnings } from './engine/calculator';
import { loadActivePackage, saveActivePackage, savePackageToLibrary, getSavedPackagesList } from './utils/storage';
import { getEmptyPackage, getRajasthanDemoPackage } from './demo/sampleData';
import { formatINR, generateUniqueId, parsePositiveNumber } from './utils/formatters';
import { printIsolatedCostingSheet } from './utils/printManager';
import { 
  Building2, 
  Car, 
  UtensilsCrossed, 
  Compass, 
  Plane, 
  PlusCircle, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Settings
} from 'lucide-react';

import { Header } from './components/Header';
import { SmartWarningsBanner } from './components/SmartWarningsBanner';
import { PackageDetailsSection } from './components/PackageDetailsSection';
import { PaxDetailsSection } from './components/PaxDetailsSection';
import { HotelsSection } from './components/HotelsSection';
import { VehiclesSection } from './components/VehiclesSection';
import { MealsSection } from './components/MealsSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { FlightTrainSection } from './components/FlightTrainSection';
import { OtherServicesSection } from './components/OtherServicesSection';
import { LiveSummary } from './components/LiveSummary';
import { CostBreakdownModal } from './components/CostBreakdownModal';
import { CalculationExplanationModal } from './components/CalculationExplanationModal';
import { SavedPackagesModal } from './components/SavedPackagesModal';
import { PrintCostingSheet } from './components/PrintCostingSheet';
import { PinGate } from './components/PinGate';

type ServiceTab = 'all' | 'hotels' | 'vehicles' | 'meals' | 'activities' | 'flights' | 'other';

export const App: React.FC = () => {
  const [packageData, setPackageData] = useState<PackageData>(() => {
    const loaded = loadActivePackage();
    if (!loaded.roomAllocation) {
      loaded.roomAllocation = { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 };
    }
    return loaded;
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [savedCount, setSavedCount] = useState<number>(() => getSavedPackagesList().length);
  const [activeTab, setActiveTab] = useState<ServiceTab>('hotels');
  const [isTopPanelCollapsed, setIsTopPanelCollapsed] = useState(false);
  const [showPaxRules, setShowPaxRules] = useState(false);

  // Modals state
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);

  // Master calculation results (memoized for instantaneous UI updates)
  const calculation = useMemo(() => calculateMasterPackageCost(packageData), [packageData]);
  const smartWarnings = useMemo(() => generateSmartWarnings(packageData), [packageData]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveActivePackage(packageData);
      setSaveStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [packageData]);

  // Fast, isolated non-blocking Print & Save PDF function
  const handlePrint = useCallback(() => {
    printIsolatedCostingSheet(packageData);
  }, [packageData]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBreakdownOpen(false);
        setIsAuditOpen(false);
        setIsSavedListOpen(false);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleNewPackage();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleSavePackage();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handleDuplicatePackage();
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handlePrint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [packageData, handlePrint]);

  // Handlers
  const handleNewPackage = useCallback(() => {
    const fresh = getEmptyPackage();
    setPackageData(fresh);
  }, []);

  const handleSavePackage = useCallback(() => {
    savePackageToLibrary(packageData);
    setSavedCount(getSavedPackagesList().length);
    setSaveStatus('saved');
    alert(`"${packageData.packageDetails.packageName}" saved to library!`);
  }, [packageData]);

  const handleDuplicatePackage = useCallback(() => {
    const dup: PackageData = {
      ...packageData,
      id: generateUniqueId('pkg'),
      packageDetails: {
        ...packageData.packageDetails,
        id: generateUniqueId('pkg'),
        packageName: `${packageData.packageDetails.packageName} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    setPackageData(dup);
  }, [packageData]);

  const handleResetPackage = useCallback(() => {
    if (window.confirm('Reset current calculator to empty defaults?')) {
      handleNewPackage();
    }
  }, [handleNewPackage]);

  const handleLoadDemo = useCallback(() => {
    const demo = getRajasthanDemoPackage();
    setPackageData(demo);
  }, []);

  const handleLoadSavedPackage = useCallback((pkg: PackageData) => {
    if (!pkg.roomAllocation) {
      pkg.roomAllocation = { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 };
    }
    setPackageData(pkg);
  }, []);

  const handleUpdatePricing = useCallback((settings: PricingSettings) => {
    setPackageData((prev) => ({
      ...prev,
      pricingSettings: settings,
    }));
  }, []);

  const handleUpdateRoomAllocation = useCallback((roomAllocation: RoomAllocation) => {
    setPackageData((prev) => ({
      ...prev,
      roomAllocation,
    }));
  }, []);

  return (
    <PinGate>
      <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header Bar */}
      <Header
        onNew={handleNewPackage}
        onSave={handleSavePackage}
        onOpenSaved={() => {
          setSavedCount(getSavedPackagesList().length);
          setIsSavedListOpen(true);
        }}
        onDuplicate={handleDuplicatePackage}
        onReset={handleResetPackage}
        onLoadDemo={handleLoadDemo}
        onPrint={handlePrint}
        saveStatus={saveStatus}
        savedCount={savedCount}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-4 py-3 no-print">
        
        {/* Smart Warnings Checklist */}
        <SmartWarningsBanner warnings={smartWarnings} />

        {/* Unified Ultra-Compact Tour & Pax Strip (Takes only ~42px) */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs mb-2 transition">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Tour Name */}
            <div className="flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="Tour Package Name *"
                value={packageData.packageDetails.packageName}
                onChange={(e) => setPackageData({
                  ...packageData,
                  packageDetails: { ...packageData.packageDetails, packageName: e.target.value, updatedAt: new Date().toISOString() }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                title="Tour Package Name"
              />
            </div>

            {/* Route */}
            <div className="w-40 sm:w-48">
              <input
                type="text"
                placeholder="Destination Route *"
                value={packageData.packageDetails.destination}
                onChange={(e) => setPackageData({
                  ...packageData,
                  packageDetails: { ...packageData.packageDetails, destination: e.target.value, updatedAt: new Date().toISOString() }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                title="Destination Route"
              />
            </div>

            {/* Travel Date */}
            <div className="w-32">
              <input
                type="date"
                value={packageData.packageDetails.travelDate}
                onChange={(e) => setPackageData({
                  ...packageData,
                  packageDetails: { ...packageData.packageDetails, travelDate: e.target.value, updatedAt: new Date().toISOString() }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                title="Travel Date"
              />
            </div>

            {/* Duration Days & Nights */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500">N:</span>
              <input
                type="number"
                min="0"
                value={packageData.packageDetails.nights ?? ''}
                onChange={(e) => setPackageData({
                  ...packageData,
                  packageDetails: { ...packageData.packageDetails, nights: parsePositiveNumber(e.target.value, 0), updatedAt: new Date().toISOString() }
                })}
                className="w-6 text-center text-xs font-black text-slate-900 bg-transparent outline-none"
                title="Nights"
              />
              <span className="text-[10px] font-bold text-slate-400">/</span>
              <span className="text-[10px] font-bold text-slate-500">D:</span>
              <input
                type="number"
                min="1"
                value={packageData.packageDetails.days ?? ''}
                onChange={(e) => setPackageData({
                  ...packageData,
                  packageDetails: { ...packageData.packageDetails, days: parsePositiveNumber(e.target.value, 1), updatedAt: new Date().toISOString() }
                })}
                className="w-6 text-center text-xs font-black text-slate-900 bg-transparent outline-none"
                title="Days"
              />
            </div>

            <div className="h-4 w-px bg-slate-200 hidden lg:block" />

            {/* Adults */}
            <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 shadow-2xs" title="Adults (12y+)">
              <span className="text-[10px] font-extrabold text-blue-900">Adults:</span>
              <input
                type="number"
                min="1"
                value={packageData.pax.adults ?? ''}
                onChange={(e) => setPackageData({
                  ...packageData,
                  pax: { ...packageData.pax, adults: parsePositiveNumber(e.target.value, 0) }
                })}
                className="w-7 text-center text-xs font-black text-blue-950 bg-transparent outline-none"
              />
            </div>

            {/* Child */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 shadow-2xs" title="Children (5-11y)">
              <span className="text-[10px] font-extrabold text-amber-900">Child:</span>
              <input
                type="number"
                min="0"
                value={packageData.pax.children ?? ''}
                onChange={(e) => setPackageData({
                  ...packageData,
                  pax: { ...packageData.pax, children: parsePositiveNumber(e.target.value, 0) }
                })}
                className="w-7 text-center text-xs font-black text-amber-950 bg-transparent outline-none"
              />
            </div>

            {/* Infant */}
            <div className="flex items-center gap-1 bg-pink-50 border border-pink-200 rounded px-1.5 py-0.5 shadow-2xs" title="Infants (<5y)">
              <span className="text-[10px] font-extrabold text-pink-900">Infant:</span>
              <input
                type="number"
                min="0"
                value={packageData.pax.infants ?? ''}
                onChange={(e) => setPackageData({
                  ...packageData,
                  pax: { ...packageData.pax, infants: parsePositiveNumber(e.target.value, 0) }
                })}
                className="w-7 text-center text-xs font-black text-pink-950 bg-transparent outline-none"
              />
            </div>

            {/* Pax Rules Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPaxRules(!showPaxRules)}
              className={`p-1 rounded border transition cursor-pointer text-[10px] font-bold flex items-center gap-1 ${
                showPaxRules
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title="Child & Infant Cost % Rules"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {/* Live Pax summary badge */}
            <div className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px] font-black font-brand tracking-wide shrink-0">
              {(packageData.pax.adults || 0) + (packageData.pax.children || 0) + (packageData.pax.infants || 0)} Pax ({calculation.adultEquivalent.toFixed(1)} Equiv)
            </div>

            {/* Full View toggle */}
            <button
              type="button"
              onClick={() => setIsTopPanelCollapsed(!isTopPanelCollapsed)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 ml-auto flex items-center gap-0.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition"
              title="Toggle detailed cards"
            >
              <span>{isTopPanelCollapsed ? 'Collapse Cards' : 'Expanded Cards'}</span>
            </button>
          </div>

          {/* Optional inline Pax % rules */}
          {showPaxRules && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-1.5 rounded">
              <span className="font-bold text-[11px] text-slate-700">Cost Sharing Rules:</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-600">Child Rate:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={packageData.pax.childPercentage ?? ''}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    pax: { ...packageData.pax, childPercentage: parsePositiveNumber(e.target.value, 70) }
                  })}
                  className="w-12 bg-white border border-slate-300 rounded px-1 text-center font-bold text-xs"
                />
                <span className="text-[11px] text-slate-500">%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-600">Infant Rate:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={packageData.pax.infantPercentage ?? ''}
                  onChange={(e) => setPackageData({
                    ...packageData,
                    pax: { ...packageData.pax, infantPercentage: parsePositiveNumber(e.target.value, 0) }
                  })}
                  className="w-12 bg-white border border-slate-300 rounded px-1 text-center font-bold text-xs"
                />
                <span className="text-[11px] text-slate-500">%</span>
              </div>
            </div>
          )}

          {/* If Full View is clicked, show the expanded cards */}
          {isTopPanelCollapsed && (
            <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-1 xl:grid-cols-12 gap-2">
              <div className="xl:col-span-7">
                <PackageDetailsSection
                  packageDetails={packageData.packageDetails}
                  onChange={(details) => setPackageData({ ...packageData, packageDetails: details })}
                />
              </div>
              <div className="xl:col-span-5">
                <PaxDetailsSection
                  pax={packageData.pax}
                  onChange={(pax) => setPackageData({ ...packageData, pax })}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          
          {/* Left Column: Interactive Costing Services */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-2.5">
            
            {/* Interactive Service Tab Bar (Fast Zero-Scroll Switching) */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 shadow-2xs flex items-center justify-between gap-1.5 overflow-x-auto sticky top-14 z-30 backdrop-blur-md bg-white/95">
              <div className="flex items-center gap-1 min-w-max">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Modules</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('hotels')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'hotels'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Hotels ({packageData.hotels.length})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'hotels' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.hotels)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vehicles')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'vehicles'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Vehicles ({packageData.vehicles.length})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'vehicles' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.vehicles)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('meals')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'meals'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Meals ({packageData.meals.length})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'meals' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.meals)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('activities')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'activities'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Activities ({packageData.activities.length})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'activities' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.activities)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('flights')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'flights'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Flight/Train ({(packageData.flightTrainFares || []).length})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'flights' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.flightTrainFares)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('other')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'other'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Other ({packageData.otherServices.length})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'other' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.otherServices)}
                  </span>
                </button>
              </div>
            </div>

            {/* Costing Services Content */}
            <div className="space-y-2.5">
              {(activeTab === 'all' || activeTab === 'hotels') && (
                <HotelsSection
                  hotels={packageData.hotels}
                  pax={packageData.pax}
                  roomAllocation={packageData.roomAllocation || { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 }}
                  packageNights={packageData.packageDetails.nights}
                  onUpdateRoomAllocation={handleUpdateRoomAllocation}
                  onChangeHotels={(hotels) => setPackageData({ ...packageData, hotels })}
                  onOpenAuditModal={() => setIsAuditOpen(true)}
                />
              )}

              {(activeTab === 'all' || activeTab === 'vehicles') && (
                <VehiclesSection
                  vehicles={packageData.vehicles}
                  pax={packageData.pax}
                  packageDays={packageData.packageDetails.days}
                  onChange={(vehicles) => setPackageData({ ...packageData, vehicles })}
                />
              )}

              {(activeTab === 'all' || activeTab === 'meals') && (
                <MealsSection
                  meals={packageData.meals}
                  pax={packageData.pax}
                  onChange={(meals) => setPackageData({ ...packageData, meals })}
                />
              )}

              {(activeTab === 'all' || activeTab === 'activities') && (
                <ActivitiesSection
                  activities={packageData.activities}
                  pax={packageData.pax}
                  onChange={(activities) => setPackageData({ ...packageData, activities })}
                />
              )}

              {(activeTab === 'all' || activeTab === 'flights') && (
                <FlightTrainSection
                  flightTrainFares={packageData.flightTrainFares || []}
                  pax={packageData.pax}
                  onChange={(flightTrainFares) => setPackageData({ ...packageData, flightTrainFares })}
                />
              )}

              {(activeTab === 'all' || activeTab === 'other') && (
                <OtherServicesSection
                  otherServices={packageData.otherServices}
                  onChange={(otherServices) => setPackageData({ ...packageData, otherServices })}
                />
              )}
            </div>

          </div>

          {/* Right Column: Sticky Live Summary & Pricing Engine */}
          <div className="lg:col-span-4 xl:col-span-4 sticky-sidebar lg:sticky lg:top-14 self-start">
            <LiveSummary
              calculation={calculation}
              pricingSettings={packageData.pricingSettings}
              pax={packageData.pax}
              onUpdatePricing={handleUpdatePricing}
              onOpenBreakdownModal={() => setIsBreakdownOpen(true)}
              onOpenAuditModal={() => setIsAuditOpen(true)}
              onPrint={handlePrint}
            />
          </div>

        </div>

      </main>

      {/* 3. Interactive Modals */}
      <CostBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        calculation={calculation}
      />

      <CalculationExplanationModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        packageData={packageData}
        calculation={calculation}
      />

      <SavedPackagesModal
        isOpen={isSavedListOpen}
        onClose={() => setIsSavedListOpen(false)}
        onLoadPackage={handleLoadSavedPackage}
        currentPackage={packageData}
      />

      {/* 4. Professional Print Layout */}
      <PrintCostingSheet
        packageData={packageData}
        calculation={calculation}
      />

    </div>
  </PinGate>
  );
};
