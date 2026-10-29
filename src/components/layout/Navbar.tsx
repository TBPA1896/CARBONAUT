import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Scale,
  Menu,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface NavbarProps {
  onOpenReset: () => void;
  onOpenScenario: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReset,
  onOpenScenario,
  onToggleMobileSidebar,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [totalBiomassTonnes, setTotalBiomassTonnes] = useState(0);

  const updateStats = () => {
    const batches = storageService.getBatches();
    const sum = batches.reduce((acc, b) => acc + b.quantityTonnes, 0);
    setTotalBiomassTonnes(sum);
  };

  useEffect(() => {
    updateStats();
    window.addEventListener('bvm_storage_update', updateStats);
    return () => window.removeEventListener('bvm_storage_update', updateStats);
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return { title: 'Overview', subtitle: 'Regional Biomass Valorization & Supply-Demand Exchange' };
      case '/inventory':
        return { title: 'Residue Inventory', subtitle: 'Standardized Agro-Processing Feedstock Registry' };
      case '/add-batch':
        return { title: 'Add Residue Batch', subtitle: 'Supplier Profiling & Material Characterization Workflow' };
      case '/recovery-lab':
        return { title: 'Material Recovery Lab', subtitle: 'Comparative Pathway Exploration: Carbon vs Mineral Recovery' };
      case '/buyers':
        return { title: 'Buyer Network', subtitle: 'Demand Verification & Technical Acceptance Specifications' };
      case '/matching':
        return { title: 'Smart Matching Engine', subtitle: 'Explainable Rules-Based Compatibility & Economic Valuation' };
      case '/logistics':
        return { title: 'Logistics', subtitle: 'Haulage Coordination & Multi-Batch Load Aggregation' };
      case '/transactions':
        return { title: 'Transactions & Verify', subtitle: 'Lifecycle Audit & Simulated Industrial End-Use Validation' };
      case '/analytics':
        return { title: 'Analytics', subtitle: 'Aggregated Performance Metrics & Regional Feedstock Flow' };
      case '/project-info':
        return { title: 'Project Information', subtitle: 'Anurag University PSE-I External Project Documentation' };
      default:
        return { title: 'Biomass Value Match', subtitle: 'AI-Driven Biomass Valorization Platform' };
    }
  };

  const pageInfo = getPageTitle(location.pathname);

  const handleQuickLoadScenario = () => {
    storageService.loadDemoScenarioState();
    navigate('/inventory');
    onOpenScenario();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile Hamburger & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-tight flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="truncate">{pageInfo.title}</span>
            <span className="hidden min-[400px]:inline-flex text-[10px] sm:text-[11px] font-semibold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              Telangana
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 hidden lg:block truncate">{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Live metric badge - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
          <Scale className="w-3.5 h-3.5 text-emerald-700" />
          <span>Active Biomass:</span>
          <strong className="text-slate-900">{totalBiomassTonnes.toLocaleString()} t</strong>
        </div>

        {/* Load Demo Scenario button */}
        <button
          onClick={handleQuickLoadScenario}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition cursor-pointer"
          title="Prepares sample records and opens the 8-step presentation walkthrough"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">Load Demo Scenario</span>
          <span className="hidden min-[400px]:inline sm:hidden">Demo</span>
        </button>

        {/* Guided Presentation Tour trigger */}
        <button
          onClick={onOpenScenario}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition cursor-pointer"
        >
          <span>Tour</span>
        </button>

        {/* Reset button */}
        <button
          onClick={onOpenReset}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition border border-transparent hover:border-slate-200 cursor-pointer"
          title="Reset demo data to baseline state"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
