import React from 'react';
import { useGuardian } from '../context/GuardianContext';
import { LayoutDashboard, Layers, ShieldCheck, FileText, Settings, Lock } from 'lucide-react';
import { audioHaptics } from '../services/audioHaptics';

export type NavTab = 'dashboard' | 'positions' | 'rules' | 'logs' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { positions, lockState } = useGuardian();

  const handleTabClick = (tab: NavTab) => {
    audioHaptics.tapFeedback();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070a12]/95 backdrop-blur-lg border-t border-dark-700/60 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5 px-2 py-1.5">
        {/* Dashboard */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Status</span>
        </button>

        {/* Positions */}
        <button
          onClick={() => handleTabClick('positions')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl relative transition-all ${
            activeTab === 'positions'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5" />
            {positions.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-purple-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {positions.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Trades</span>
        </button>

        {/* Rules */}
        <button
          onClick={() => handleTabClick('rules')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'rules'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1">Rules</span>
        </button>

        {/* Logs */}
        <button
          onClick={() => handleTabClick('logs')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'logs'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-1">Logs</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
