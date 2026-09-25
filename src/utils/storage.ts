import { PackageData } from '../types';
import { getRajasthanDemoPackage } from '../demo/sampleData';

const ACTIVE_PACKAGE_KEY = 'mastitrips_active_package_v1';
const SAVED_PACKAGES_KEY = 'mastitrips_saved_packages_v1';

export function loadActivePackage(): PackageData {
  try {
    const raw = localStorage.getItem(ACTIVE_PACKAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.packageDetails && parsed.pax) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading active package from localStorage:', err);
  }
  // Default to Demo Package on first load so user immediately sees a working calculator!
  return getRajasthanDemoPackage();
}

export function saveActivePackage(pkg: PackageData): void {
  try {
    const toSave = {
      ...pkg,
      packageDetails: {
        ...pkg.packageDetails,
        updatedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(ACTIVE_PACKAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Error saving active package to localStorage:', err);
  }
}

export function getSavedPackagesList(): PackageData[] {
  try {
    const raw = localStorage.getItem(SAVED_PACKAGES_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error('Error loading saved packages list:', err);
  }
  return [];
}

export function savePackageToLibrary(pkg: PackageData): void {
  try {
    const list = getSavedPackagesList();
    const existingIndex = list.findIndex(p => p.id === pkg.id);
    const updatedPkg = {
      ...pkg,
      packageDetails: {
        ...pkg.packageDetails,
        updatedAt: new Date().toISOString(),
      },
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedPkg;
    } else {
      list.unshift(updatedPkg);
    }

    localStorage.setItem(SAVED_PACKAGES_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving package to library:', err);
  }
}

export function deletePackageFromLibrary(id: string): void {
  try {
    const list = getSavedPackagesList().filter(p => p.id !== id);
    localStorage.setItem(SAVED_PACKAGES_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error deleting package from library:', err);
  }
}
