import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  FolderOpen, 
  Copy, 
  RotateCcw, 
  Printer, 
  Sparkles, 
  Keyboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Compass,
  FileSpreadsheet,
  Lock,
  KeyRound,
  Download
} from 'lucide-react';
import { usePinSecurity } from './PinGate';

interface HeaderProps {
  onNew: () => void;
  onSave: () => void;
  onOpenSaved: () => void;
  onDuplicate: () => void;
  onReset: () => void;
  onLoadDemo: () => void;
  onPrint: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNew,
  onSave,
  onOpenSaved,
  onDuplicate,
  onReset,
  onLoadDemo,
  onPrint,
  saveStatus,
  savedCount,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const { lock, openChangePin } = usePinSecurity();

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md backdrop-blur-md bg-slate-900/95">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 py-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-sm shadow ring-1 ring-white/10">
              M
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight font-brand text-white">Masti<span className="text-orange-400">Trips</span></span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                PRO
              </span>
              <span className="text-[10px] text-slate-400 font-semibold hidden md:inline ml-1">Domestic Costing Engine</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center flex-wrap gap-1.5">
            
            {/* Auto-save status badge */}
            <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-300">
              {saveStatus === 'saved' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300 text-[10px]">Saved</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300 text-[10px]">Saving</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  <span className="text-slate-400 text-[10px]">Editing</span>
                </>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={onNew}
              title="Ctrl + N"
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3 h-3 text-blue-400" />
              <span>New</span>
            </button>

            <button
              onClick={onSave}
              title="Ctrl + S"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition cursor-pointer shadow-md active:scale-95 ring-1 ring-blue-400/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={onOpenSaved}
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition cursor-pointer shadow-xs active:scale-95"
            >
              <FolderOpen className="w-3 h-3 text-amber-400" />
              <span>Library ({savedCount})</span>
            </button>

            <button
              onClick={onDuplicate}
              title="Ctrl + D"
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition cursor-pointer shadow-xs active:scale-95 hidden sm:flex"
            >
              <Copy className="w-3 h-3 text-indigo-400" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-orange-200 bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 rounded-md transition cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Demo</span>
            </button>

            <button
              onClick={onReset}
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-md transition cursor-pointer"
              title="Reset Package"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Print Quotation */}
            <button
              onClick={onPrint}
              title="Ctrl + P"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 rounded-md transition cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3 h-3 text-white" />
              <span className="hidden sm:inline">Print Quotation</span>
              <span className="sm:hidden">Print</span>
            </button>

            {/* Install as Chrome Application */}
            {isInstallable && (
              <button
                onClick={handleInstallApp}
                title="Install MastiTrips as Chrome Desktop/Mobile App"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition cursor-pointer shadow-xs active:scale-95 ring-1 ring-emerald-400/40"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            {/* Change PIN */}
            <button
              onClick={openChangePin}
              title="Change Security PIN"
              className="p-1 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-md transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>

            {/* Lock App */}
            <button
              onClick={lock}
              title="Lock Calculator"
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 rounded-md transition cursor-pointer active:scale-95"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>

            {/* Keyboard shortcut help */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                title="Keyboard Shortcuts"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {showShortcuts && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs z-50 border border-slate-700 animate-in fade-in zoom-in-95">
                  <div className="font-bold border-b border-slate-700 pb-1.5 mb-2 text-slate-200 flex items-center justify-between">
                    <span>Keyboard Shortcuts</span>
                    <span className="text-[10px] text-slate-400">⚡ Fast Costing</span>
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span>New Package</span>
                      <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700">Ctrl + N</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Save Package</span>
                      <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700">Ctrl + S</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Duplicate Package</span>
                      <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700">Ctrl + D</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Print Quotation</span>
                      <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700">Ctrl + P</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Close Dialogs</span>
                      <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700">Esc</kbd>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
