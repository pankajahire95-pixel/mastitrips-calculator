import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PackageData, PricingSettings, RoomAllocation } from './types';
import { calculateMasterPackageCost, generateSmartWarnings } from './engine/calculator';
import { loadActivePackage, saveActivePackage, savePackageToLibrary, getSavedPackagesList } from './utils/storage';
import { getEmptyPackage, getRajasthanDemoPackage } from './demo/sampleData';
import { generateUniqueId } from './utils/formatters';
import { printIsolatedCostingSheet } from './utils/printManager';

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
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 py-6 no-print">
        
        {/* Smart Warnings Checklist */}
        <SmartWarningsBanner warnings={smartWarnings} />

        {/* 2-Column Responsive Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Full-Width Spacious Input Modules */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            
            {/* Module 1: Tour Package Details (Full Width Spacious) */}
            <PackageDetailsSection
              packageDetails={packageData.packageDetails}
              onChange={(details) => setPackageData({ ...packageData, packageDetails: details })}
            />

            {/* Module 2: Passenger (Pax) Configuration (Full Width Spacious) */}
            <PaxDetailsSection
              pax={packageData.pax}
              onChange={(pax) => setPackageData({ ...packageData, pax })}
            />

            {/* Module 3: Hotels (Combined Tour Room Allocation + Multi-Hotel Engine) */}
            <HotelsSection
              hotels={packageData.hotels}
              pax={packageData.pax}
              roomAllocation={packageData.roomAllocation || { doubleRooms: 1, tripleRooms: 0, quadRooms: 0 }}
              packageNights={packageData.packageDetails.nights}
              onUpdateRoomAllocation={handleUpdateRoomAllocation}
              onChangeHotels={(hotels) => setPackageData({ ...packageData, hotels })}
              onOpenAuditModal={() => setIsAuditOpen(true)}
            />

            {/* Module 4: Vehicles & Transport */}
            <VehiclesSection
              vehicles={packageData.vehicles}
              pax={packageData.pax}
              packageDays={packageData.packageDetails.days}
              onChange={(vehicles) => setPackageData({ ...packageData, vehicles })}
            />

            {/* Module 5: Meals & Catering */}
            <MealsSection
              meals={packageData.meals}
              pax={packageData.pax}
              onChange={(meals) => setPackageData({ ...packageData, meals })}
            />

            {/* Module 6: Activities & Experiences */}
            <ActivitiesSection
              activities={packageData.activities}
              pax={packageData.pax}
              onChange={(activities) => setPackageData({ ...packageData, activities })}
            />

            {/* Module 7: Flight & Train Fares (Per Person) */}
            <FlightTrainSection
              flightTrainFares={packageData.flightTrainFares || []}
              pax={packageData.pax}
              onChange={(flightTrainFares) => setPackageData({ ...packageData, flightTrainFares })}
            />

            {/* Module 8: Other Ancillary Services */}
            <OtherServicesSection
              otherServices={packageData.otherServices}
              onChange={(otherServices) => setPackageData({ ...packageData, otherServices })}
            />

          </div>

          {/* Right Column: Sticky Live Summary & Pricing Engine */}
          <div className="lg:col-span-4 xl:col-span-4 sticky-sidebar lg:sticky lg:top-20 self-start">
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
  );
};
