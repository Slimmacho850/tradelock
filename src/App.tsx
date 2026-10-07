import React, { useState } from 'react';
import { GuardianProvider, useGuardian } from './context/GuardianContext';
import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';
import { QuickStats } from './components/QuickStats';
import { RuleGauges } from './components/RuleGauges';
import { EmergencyPanicButton } from './components/EmergencyPanicButton';
import { PositionsList } from './components/PositionsList';
import { RulesTab } from './components/RulesTab';
import { AuditLogTab } from './components/AuditLogTab';
import { SettingsTab } from './components/SettingsTab';
import { SimulationControls } from './components/SimulationControls';
import { Navigation, NavTab } from './components/Navigation';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Centered Mobile Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative pb-20 shadow-2xl">
        <Header />

        <main className="p-4 flex-1 space-y-4">
          {activeTab === 'dashboard' && (
            <>
              <StatusBanner />
              <QuickStats />
              <RuleGauges />
              <EmergencyPanicButton />
              <SimulationControls />
              <PositionsList />
            </>
          )}

          {activeTab === 'positions' && (
            <div className="space-y-4 pb-20">
              <StatusBanner />
              <PositionsList />
              <SimulationControls />
            </div>
          )}

          {activeTab === 'rules' && <RulesTab />}

          {activeTab === 'logs' && <AuditLogTab />}

          {activeTab === 'settings' && <SettingsTab />}
        </main>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GuardianProvider>
      <AppContent />
    </GuardianProvider>
  );
}
