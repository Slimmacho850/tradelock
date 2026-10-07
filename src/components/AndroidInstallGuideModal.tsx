import React from 'react';
import { Smartphone, X, Download, Globe, CheckCircle2, ChevronRight } from 'lucide-react';

export const AndroidInstallGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-center justify-between pb-2 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Install on Android Phone</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          You can install MT5 Risk Guardian as a standalone native-feeling Android app directly from Google Chrome:
        </p>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-dark-950 p-3 rounded-2xl border border-dark-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Open in Mobile Chrome</strong>
              Open this web address in <strong>Google Chrome</strong> on your Android phone.
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-dark-950 p-3 rounded-2xl border border-dark-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Tap the 3 Dots Menu (⋮)</strong>
              Tap the browser menu icon in the top right corner of Chrome.
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-dark-950 p-3 rounded-2xl border border-dark-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div className="text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Tap "Install App" or "Add to Home Screen"</strong>
              Android will prompt you to install. Tap <strong>Install</strong>.
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 bg-dark-950 p-3 rounded-2xl border border-dark-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div className="text-xs text-slate-300">
              <strong className="text-white block mb-0.5">Launch & Place Next to MT5</strong>
              The app will launch full screen with its own icon, no address bar, with full native performance and alarms!
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs uppercase tracking-wider"
        >
          GOT IT, CLOSE GUIDE
        </button>
      </div>
    </div>
  );
};
