import React, { useState } from 'react';
import { useGuardian } from '../context/GuardianContext';
import { MetaApiConfig } from '../types/guardian';
import { Settings, Key, Server, Globe, ExternalLink, Smartphone, Cloud, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { AndroidInstallGuideModal } from './AndroidInstallGuideModal';
import { audioHaptics } from '../services/audioHaptics';

export const SettingsTab: React.FC = () => {
  const {
    metaConfig,
    updateMetaConfig,
    refreshData,
    isConnected,
    isLoading,
    isDemoMode,
    setIsDemoMode
  } = useGuardian();

  const [formData, setFormData] = useState<MetaApiConfig>(metaConfig);
  const [showToken, setShowToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleSave = async () => {
    audioHaptics.tapFeedback();
    updateMetaConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    await refreshData();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Settings & MT5 Cloud Connection
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure MetaApi credentials for real cloud MT5 monitoring and Android deployment.
        </p>
      </div>

      {/* MetaApi Credentials Form */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              MetaApi Cloud API Credentials
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isConnected && !isDemoMode
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {isConnected && !isDemoMode ? 'CONNECTED' : 'NOT CONNECTED'}
          </span>
        </div>

        {/* API Token */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>MetaApi Auth Token</span>
            <a
              href="https://app.metaapi.cloud/token"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Get Token <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="e.g. eyJhbGciOi..."
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 pr-10 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Account ID */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>MetaApi MT5 Account ID</span>
            <a
              href="https://app.metaapi.cloud/accounts"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
            >
              View Accounts <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <input
            type="text"
            placeholder="e.g. 4882101b-c74f-4d92-..."
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Region */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Server Region</label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
            className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="new-york">New York (North America)</option>
            <option value="london">London (Europe)</option>
            <option value="singapore">Singapore (Asia)</option>
            <option value="tokyo">Tokyo (Japan)</option>
            <option value="germany">Frankfurt (Germany)</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>SAVED!</span>
              </>
            ) : (
              <span>SAVE CREDENTIALS</span>
            )}
          </button>

          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold text-xs border border-dark-700 active:scale-95 transition-all"
          >
            {isDemoMode ? 'Switch to Live' : 'Switch to Demo'}
          </button>
        </div>
      </div>

      {/* Android Mobile Installation Card */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Run as Native Android App</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          You can add this app to your Android home screen as a standalone PWA or export an APK. It functions with fullscreen UI, haptics, and alarms.
        </p>
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-dark-950 hover:bg-dark-800 border border-dark-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          View Android Installation Steps
        </button>
      </div>

      {/* 24/7 Cloud Sentinel Guide */}
      <div className="bg-dark-900/90 border border-dark-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">24/7 Background Cloud Sentinel</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Want the lock rules enforced even if your phone battery dies or the screen is turned off?
          We've bundled a standalone Node.js daemon (<code className="text-emerald-400">backend/sentinel.js</code>) that can run 24/7 on free cloud hosts (Railway, Render, Koyeb) or any server.
        </p>
        <div className="bg-dark-950 p-2.5 rounded-xl border border-dark-800 text-[11px] font-mono text-slate-300">
          npm run sentinel
        </div>
      </div>

      <AndroidInstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};
