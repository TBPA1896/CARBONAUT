import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Info,
  Scale,
  MapPin,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface NavbarProps {
  onOpenReset: () => void;
  onOpenScenario: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReset, onOpenScenario }) => {
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
        return { title: 'Overview Dashboard', subtitle: 'Regional Biomass Valorization & Supply-Demand Exchange' };
      case '/inventory':
        return { title: 'Residue Inventory', subtitle: 'Standardized Agro-Processing Feedstock Registry' };
      case '/add-batch':
        return { title: 'Add Residue Batch', subtitle: 'Supplier Profiling & Material Characterization Workflow' };
      case '/recovery-lab':
        return { title: 'Material Recovery Lab', subtitle: 'Comparative Pathway Exploration: Carbon vs Mineral Recovery' };
      case '/buyers':
        return { title: 'Industry Buyer Network', subtitle: 'Demand Verification & Technical Acceptance Specifications' };
      case '/matching':
        return { title: 'Smart Matching Engine', subtitle: 'Explainable Rules-Based Compatibility & Economic Valuation' };
      case '/logistics':
        return { title: 'Collection & Logistics', subtitle: 'Haulage Coordination & Multi-Batch Load Aggregation' };
      case '/transactions':
        return { title: 'Transactions & Verification', subtitle: 'Lifecycle Audit & Simulated Industrial End-Use Validation' };
      case '/analytics':
        return { title: 'Analytics & Reporting', subtitle: 'Aggregated Performance Metrics & Regional Feedstock Flow' };
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Title & Context */}
      <div>
        <h2 className="text-base font-bold text-slate-800 leading-tight flex items-center gap-2">
          {pageInfo.title}
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Telangana Region
          </span>
        </h2>
        <p className="text-xs text-slate-500 hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live metric badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
          <Scale className="w-3.5 h-3.5 text-emerald-700" />
          <span>Active Biomass:</span>
          <strong className="text-slate-900">{totalBiomassTonnes.toLocaleString()} t</strong>
        </div>

        {/* Load Demo Scenario button */}
        <button
          onClick={handleQuickLoadScenario}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition cursor-pointer"
          title="Prepares sample records and opens the 8-step presentation walkthrough"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Load Demo Scenario</span>
        </button>

        {/* Guided Presentation Tour trigger */}
        <button
          onClick={onOpenScenario}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition cursor-pointer"
        >
          <span>Guided Tour</span>
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
