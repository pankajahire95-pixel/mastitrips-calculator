import React, { useState, useEffect } from 'react';
import { PackageData } from '../types';
import { getSavedPackagesList, deletePackageFromLibrary, savePackageToLibrary } from '../utils/storage';
import { formatINR, generateUniqueId } from '../utils/formatters';
import { calculateMasterPackageCost } from '../engine/calculator';
import { 
  X, 
  FolderOpen, 
  Trash2, 
  Copy, 
  Upload, 
  Download, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface SavedPackagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPackage: (pkg: PackageData) => void;
  currentPackage: PackageData;
}

export const SavedPackagesModal: React.FC<SavedPackagesModalProps> = ({
  isOpen,
  onClose,
  onLoadPackage,
  currentPackage,
}) => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshList = () => {
    setPackages(getSavedPackagesList());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    savePackageToLibrary(currentPackage);
    setSuccessMsg('Current package successfully saved to your library!');
    refreshList();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDuplicate = (pkg: PackageData) => {
    const copy: PackageData = {
      ...pkg,
      id: generateUniqueId('pkg_copy'),
      packageDetails: {
        ...pkg.packageDetails,
        id: generateUniqueId('pkg_copy'),
        packageName: `${pkg.packageDetails.packageName} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    savePackageToLibrary(copy);
    refreshList();
  };

  const handleDelete = (id: string) => {
    deletePackageFromLibrary(id);
    refreshList();
  };

  const handleExportJson = (pkg: PackageData) => {
    const jsonStr = JSON.stringify(pkg, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pkg.packageDetails.packageName.replace(/[^a-zA-Z0-9]/g, '_')}_Costing.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.packageDetails && parsed.pax) {
          const importedPkg: PackageData = {
            ...parsed,
            id: generateUniqueId('pkg_import'),
            packageDetails: {
              ...parsed.packageDetails,
              id: generateUniqueId('pkg_import'),
              packageName: `${parsed.packageDetails.packageName} (Imported)`,
              updatedAt: new Date().toISOString(),
            },
          };
          savePackageToLibrary(importedPkg);
          refreshList();
          setSuccessMsg('Package successfully imported from file!');
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          alert('Invalid package file format.');
        }
      } catch (err) {
        alert('Could not parse package JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-brand">
                Saved Package Costings Library
              </h3>
              <p className="text-xs text-slate-400">
                Offline browser storage • Save, duplicate, or export package files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition cursor-pointer"
          >
            <span>+ Save Current Package to Library</span>
          </button>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* List of Saved Packages */}
        <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {packages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No saved packages yet</p>
              <p className="text-xs text-slate-400 mb-3">Save current package or import a previous costing</p>
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Save Current Package
              </button>
            </div>
          ) : (
            packages.map((pkg) => {
              const calc = calculateMasterPackageCost(pkg);
              const isCurrent = pkg.id === currentPackage.id;

              return (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {pkg.packageDetails.packageName || 'Untitled Package'}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                            Active in Editor
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {pkg.packageDetails.destination && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {pkg.packageDetails.destination}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {pkg.packageDetails.days}D / {pkg.packageDetails.nights}N
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {pkg.pax.adults}A + {pkg.pax.children}C
                        </span>
                      </div>
                    </div>

                    {/* Price Badges & Load Action */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Selling Price</div>
                        <div className="text-sm font-extrabold text-orange-600 font-brand">
                          {formatINR(calc.sellingPrice)}
                        </div>
                        <div className="text-[10px] text-slate-500">Net: {formatINR(calc.totalNetCost)}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadPackage(pkg);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Load
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(pkg)}
                        title="Duplicate package"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportJson(pkg)}
                        title="Export JSON"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(pkg.id)}
                        title="Delete package"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
