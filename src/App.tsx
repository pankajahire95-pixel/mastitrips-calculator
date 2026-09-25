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
  Settings,
  Printer,
  X
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
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

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
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-3 py-2 pb-24 lg:pb-2 no-print">
        
        {/* Smart Warnings Checklist */}
        <SmartWarningsBanner warnings={smartWarnings} />

        {/* Tour & Pax Configuration Cards (Equal 50/50 Desktop Size) */}
        {!isTopPanelCollapsed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-2.5 items-stretch">
            <div className="w-full h-full flex flex-col">
              <PackageDetailsSection
                packageDetails={packageData.packageDetails}
                onChange={(details) => setPackageData({ ...packageData, packageDetails: details })}
              />
            </div>
            <div className="w-full h-full flex flex-col">
              <PaxDetailsSection
                pax={packageData.pax}
                onChange={(pax) => setPackageData({ ...packageData, pax })}
              />
            </div>
          </div>
        )}

        {/* Minimal Toggle to collapse/expand top header */}
        <div className="flex justify-end mb-2 -mt-1">
          <button
            type="button"
            onClick={() => setIsTopPanelCollapsed(!isTopPanelCollapsed)}
            className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{isTopPanelCollapsed ? 'Expand Tour & Pax Header' : 'Collapse Tour & Pax Header'}</span>
            {isTopPanelCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* 2-Column Responsive Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
          
          {/* Left Column: Interactive Costing Services */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-2">
            
            {/* Interactive Service Tab Bar (Fast Zero-Scroll Switching) */}
            <div className="bg-white rounded-lg border border-slate-300 p-0.5 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto sticky top-12 z-30 backdrop-blur-md bg-white/95">
              <div className="flex items-center gap-0.5 min-w-max">
                <button
                  type="button"
                  onClick={() => setActiveTab('hotels')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'hotels'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Hotels ({packageData.hotels.length})</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${activeTab === 'hotels' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.hotels)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vehicles')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'vehicles'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Vehicles ({packageData.vehicles.length})</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${activeTab === 'vehicles' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.vehicles)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('meals')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'meals'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Meals ({packageData.meals.length})</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${activeTab === 'meals' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.meals)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('activities')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'activities'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Activities ({packageData.activities.length})</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${activeTab === 'activities' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.activities)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('flights')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'flights'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Flight/Train ({(packageData.flightTrainFares || []).length})</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${activeTab === 'flights' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.flightTrainFares)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('other')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'other'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Other ({packageData.otherServices.length})</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${activeTab === 'other' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'}`}>
                    {formatINR(calculation.categoryTotals.otherServices)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All</span>
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

      {/* 2.5 Mobile Floating Quotation Bar (< lg screens for Remote Work) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white px-3 py-2 shadow-2xl flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <span>Quotation</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                +{formatINR(calculation.profit)}
              </span>
            </div>
            <div className="text-base sm:text-lg font-black font-brand text-orange-400 leading-tight">
              {formatINR(calculation.sellingPrice)}
            </div>
          </div>
          <div className="border-l border-slate-700 pl-2 text-left">
            <div className="text-[9px] text-slate-400 font-medium">Per Adult</div>
            <div className="text-xs font-bold text-white font-brand">
              {formatINR(calculation.adultSellingPrice)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(true)}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
          >
            <span>Summary</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-lg transition border border-slate-700 active:scale-95 cursor-pointer"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Live Summary Bottom Drawer Modal */}
      {isMobileSummaryOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-2xl shadow-2xl border-t border-slate-300 max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-bold text-xs">₹</div>
                <span className="font-bold text-sm font-brand">Live Quotation & Pricing</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto">
              <LiveSummary
                calculation={calculation}
                pricingSettings={packageData.pricingSettings}
                pax={packageData.pax}
                onUpdatePricing={handleUpdatePricing}
                onOpenBreakdownModal={() => {
                  setIsMobileSummaryOpen(false);
                  setIsBreakdownOpen(true);
                }}
                onOpenAuditModal={() => {
                  setIsMobileSummaryOpen(false);
                  setIsAuditOpen(true);
                }}
                onPrint={() => {
                  setIsMobileSummaryOpen(false);
                  handlePrint();
                }}
              />
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close & Continue Costing
              </button>
            </div>
          </div>
        </div>
      )}

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
