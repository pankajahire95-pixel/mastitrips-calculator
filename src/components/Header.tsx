import React, { useState } from 'react';
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
  KeyRound
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
  const { lock, openChangePin } = usePinSecurity();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg backdrop-blur-md bg-slate-900/95">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md ring-2 ring-white/10">
                M
              </div>
              <div className="leading-tight">
                <div className="text-xl font-extrabold tracking-tight font-brand flex items-center gap-1">
                  <span className="text-white">Masti</span>
                  <span className="text-orange-400">Trips</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30 ml-1.5 hidden sm:inline-block">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span>Domestic Tour Costing Engine</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-bold">₹ INR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Auto-save status badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300 shadow-inner">
              {saveStatus === 'saved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300">Auto-saved</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-300">Saving...</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  <span className="text-slate-400">Editing</span>
                </>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={onNew}
              title="Ctrl + N"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Library ({savedCount})</span>
            </button>

            <button
              onClick={onDuplicate}
              title="Ctrl + D"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer shadow-xs active:scale-95 hidden sm:flex"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-200 bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Demo</span>
            </button>

            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition cursor-pointer"
              title="Reset Package"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Print / Save PDF Quotation Button */}
            <button
              onClick={onPrint}
              title="Ctrl + P"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 rounded-lg transition cursor-pointer shadow-md active:scale-95 ring-1 ring-orange-300/40"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print Quotation</span>
            </button>

            {/* Change PIN */}
            <button
              onClick={openChangePin}
              title="Change 4-Digit Security PIN"
              className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Lock App */}
            <button
              onClick={lock}
              title="Lock Calculator (4-Digit PIN required to reopen)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 rounded-lg transition cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>

            {/* Keyboard shortcut help */}
            <div className="relative">
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
