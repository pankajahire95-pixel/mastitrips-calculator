import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, Delete, Check, AlertCircle, X } from 'lucide-react';

const PIN_STORAGE_KEY = 'mastitrips_security_pin_v2';
const AUTH_STATUS_KEY = 'mastitrips_auth_unlocked_v2';
const DEFAULT_PIN = '1221';

export const getStoredPin = (): string => {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
};

export const setStoredPin = (newPin: string): void => {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
  } catch (e) {
    console.error('Failed to save PIN:', e);
  }
};

export const checkIsUnlocked = (): boolean => {
  try {
    return localStorage.getItem(AUTH_STATUS_KEY) === 'true';
  } catch {
    return false;
  }
};

export const lockApp = (): void => {
  try {
    localStorage.removeItem(AUTH_STATUS_KEY);
  } catch (e) {
    console.error('Failed to lock:', e);
  }
};

export const unlockApp = (remember: boolean): void => {
  try {
    if (remember) {
      localStorage.setItem(AUTH_STATUS_KEY, 'true');
    } else {
      sessionStorage.setItem(AUTH_STATUS_KEY, 'true');
    }
  } catch (e) {
    console.error('Failed to unlock:', e);
  }
};

export interface PinSecurityContextValue {
  isUnlocked: boolean;
  lock: () => void;
  openChangePin: () => void;
}

export const PinSecurityContext = React.createContext<PinSecurityContextValue>({
  isUnlocked: false,
  lock: () => {},
  openChangePin: () => {},
});

export const usePinSecurity = () => React.useContext(PinSecurityContext);

interface PinGateProps {
  children: React.ReactNode;
}

export const PinGate: React.FC<PinGateProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(AUTH_STATUS_KEY) === 'true' ||
        sessionStorage.getItem(AUTH_STATUS_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  
  // Change PIN modal state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus first input when locked
  useEffect(() => {
    if (!isUnlocked) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isUnlocked]);

  // Global key listener for locking/unlocking
  const triggerUnlock = (enteredPin: string) => {
    const correctPin = getStoredPin();
    if (enteredPin === correctPin) {
      unlockApp(rememberDevice);
      setIsUnlocked(true);
      setErrorMsg('');
      setDigits(['', '', '', '']);
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setIsShaking(false);
        setDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }, 500);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    // Only allow single digit
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setErrorMsg('');

    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 4 && newDigits.every(d => d !== '')) {
      triggerUnlock(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleKeypadPress = (num: string) => {
    const emptyIndex = digits.findIndex(d => d === '');
    if (emptyIndex !== -1) {
      handleDigitChange(emptyIndex, num);
    }
  };

  const handleKeypadDelete = () => {
    const lastFilledIndex = digits.map(d => d !== '').lastIndexOf(true);
    if (lastFilledIndex !== -1) {
      const newDigits = [...digits];
      newDigits[lastFilledIndex] = '';
      setDigits(newDigits);
      setErrorMsg('');
      inputRefs[lastFilledIndex].current?.focus();
    }
  };

  const handleLockNow = () => {
    lockApp();
    try {
      sessionStorage.removeItem(AUTH_STATUS_KEY);
    } catch {}
    setIsUnlocked(false);
    setDigits(['', '', '', '']);
  };

  // Change PIN handler
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError('');
    setChangePinSuccess(false);

    const actualPin = getStoredPin();
    if (currentPinInput !== actualPin) {
      setChangePinError('Current PIN is incorrect');
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setChangePinError('New PIN must be exactly 4 digits');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setChangePinError('New PIN and confirmation do not match');
      return;
    }

    setStoredPin(newPinInput);
    setChangePinSuccess(true);
    setTimeout(() => {
      setShowChangePinModal(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setChangePinSuccess(false);
    }, 1200);
  };

  // If unlocked, render the children app with a floating lock/settings option
  if (isUnlocked) {
    return (
      <PinSecurityContext.Provider value={{ isUnlocked, lock: handleLockNow, openChangePin: () => setShowChangePinModal(true) }}>
        {children}

        {/* Change PIN Modal */}
        {showChangePinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 relative">
              <button
                onClick={() => setShowChangePinModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-brand">Change Security PIN</h3>
                  <p className="text-xs text-slate-500">Update your 4-digit access code</p>
                </div>
              </div>

              {changePinError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{changePinError}</span>
                </div>
              )}

              {changePinSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>PIN changed successfully!</span>
                </div>
              )}

              <form onSubmit={handleChangePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter current PIN"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center tracking-widest font-mono text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit PIN"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center tracking-widest font-mono text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Re-enter new PIN"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center tracking-widest font-mono text-base"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePinModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-colors"
                  >
                    Update PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PinSecurityContext.Provider>
    );
  }

  // Locked View
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Card */}
      <div 
        className={`w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 transition-transform ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 text-white shadow-xl shadow-blue-500/20 ring-4 ring-slate-800/80 mb-3.5">
            <Lock className="w-7 h-7" />
          </div>
          <div className="text-2xl font-black tracking-tight text-white font-brand flex items-center justify-center gap-1.5">
            <span>Masti</span>
            <span className="text-orange-400">Trips</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
              PRO
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-300 mt-1">
            Internal Costing Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Private Access: Enter 4-digit PIN to unlock
          </p>
        </div>

        {/* 4-Digit Display Boxes */}
        <div className="flex justify-center gap-3.5 mb-5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-13 h-15 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-200 outline-none ${
                errorMsg
                  ? 'border-rose-500/80 bg-rose-950/20 text-rose-300'
                  : digit
                  ? 'border-orange-500 bg-orange-950/20 text-orange-300 ring-4 ring-orange-500/20'
                  : 'border-slate-700 bg-slate-800/80 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="h-6 flex items-center justify-center mb-3">
          {errorMsg ? (
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              Confidential pricing data is encrypted
            </span>
          )}
        </div>

        {/* Numeric On-Screen Keypad (Especially handy on touch devices) */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700/60 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDigits(['', '', '', ''])}
            className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700/60 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleKeypadDelete}
            className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 active:scale-95 transition-all flex items-center justify-center"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Remember device checkbox */}
        <label className="flex items-center justify-center gap-2 text-xs text-slate-400 select-none cursor-pointer hover:text-slate-300">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-0 w-3.5 h-3.5"
          />
          <span>Remember access on this browser</span>
        </label>
      </div>

      {/* Footer security badge */}
      <div className="mt-6 text-center text-xs text-slate-500 relative z-10 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>MastiTrips Proprietary Costing Engine • Confidential & Authorized Use Only</span>
      </div>
    </div>
  );
};
