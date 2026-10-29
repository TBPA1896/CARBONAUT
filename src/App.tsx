import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ResetModal } from './components/common/ResetModal';
import { DemoScenarioModal } from './components/common/DemoScenarioModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { InventoryPage } from './pages/InventoryPage';
import { AddBatchPage } from './pages/AddBatchPage';
import { RecoveryLabPage } from './pages/RecoveryLabPage';
import { BuyerNetworkPage } from './pages/BuyerNetworkPage';
import { SmartMatchingPage } from './pages/SmartMatchingPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProjectInfoPage } from './pages/ProjectInfoPage';

import { storageService } from './services/storageService';
import './App.css';

export const App: React.FC = () => {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);

  useEffect(() => {
    storageService.initStorage();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
        {/* Left Persistent Navigation Sidebar */}
        <Sidebar
          onOpenReset={() => setIsResetOpen(true)}
          onOpenScenario={() => setIsScenarioOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Sticky Header */}
          <Navbar
            onOpenReset={() => setIsResetOpen(true)}
            onOpenScenario={() => setIsScenarioOpen(true)}
          />

          {/* Main Route Content */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/overview" element={<Navigate to="/" replace />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/add-batch" element={<AddBatchPage />} />
              <Route path="/recovery-lab" element={<RecoveryLabPage />} />
              <Route path="/buyers" element={<BuyerNetworkPage />} />
              <Route path="/matching" element={<SmartMatchingPage />} />
              <Route path="/logistics" element={<LogisticsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/project-info" element={<ProjectInfoPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Presentation Walkthrough Modal */}
        <DemoScenarioModal
          isOpen={isScenarioOpen}
          onClose={() => setIsScenarioOpen(false)}
        />

        {/* Global Reset Demo Data Modal */}
        <ResetModal
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
          onResetSuccess={() => {}}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
