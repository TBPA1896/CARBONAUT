import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Play,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Building2,
  Scale,
  IndianRupee,
  Truck,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { matchingEngine } from '../services/matchingEngine';
import { residueService } from '../services/residueService';
import { buyerService } from '../services/buyerService';
import { transactionService } from '../services/transactionService';
import { storageService } from '../services/storageService';
import {
  ResidueBatch,
  BuyerProfile,
  MatchResult,
  MatchingWeights,
  UtilizationPathway,
} from '../types';

export const SmartMatchingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [batches, setBatches] = useState<ResidueBatch[]>([]);
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [weights, setWeights] = useState<MatchingWeights>(storageService.getMatchingWeights());

  // Navigation state passed from other pages (e.g. from Inventory or Recovery Lab)
  const navBatchId = (location.state as any)?.selectedBatchId;
  const navPathway = (location.state as any)?.selectedPathway;

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    navBatchId || 'BATCH-RH-2026-001'
  );
  const [selectedPathway, setSelectedPathway] = useState<UtilizationPathway>(
    navPathway || 'Silica-rich ash recovery'
  );

  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [hasRunMatch, setHasRunMatch] = useState(true);
  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible'>('eligible');

  // Match results
  const [eligibleMatches, setEligibleMatches] = useState<MatchResult[]>([]);
  const [ineligibleMatches, setIneligibleMatches] = useState<MatchResult[]>([]);

  // Simulation modal for buyer request
  const [requestTargetMatch, setRequestTargetMatch] = useState<MatchResult | null>(null);
  const [proposedPickupDate, setProposedPickupDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [offeredPrice, setOfferedPrice] = useState<number>(0);

  const loadData = () => {
    const allBatches = residueService.getAllBatches();
    const allBuyers = buyerService.getAllBuyers();
    setBatches(allBatches);
    setBuyers(allBuyers);

    const activeBatch = allBatches.find((b) => b.id === selectedBatchId) || allBatches[0];
    if (activeBatch && !navPathway) {
      setSelectedPathway(activeBatch.preferredRoute);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bvm_storage_update', loadData);
    return () => window.removeEventListener('bvm_storage_update', loadData);
  }, []);

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  // Run the deterministic rules-based matching algorithm
  const executeMatching = () => {
    if (!activeBatch || buyers.length === 0) return;
    const { eligible, ineligible } = matchingEngine.matchBatchWithAllBuyers(
      activeBatch,
      buyers,
      selectedPathway,
      weights
    );
    setEligibleMatches(eligible);
    setIneligibleMatches(ineligible);
    setHasRunMatch(true);
  };

  useEffect(() => {
    if (activeBatch) {
      executeMatching();
    }
  }, [selectedBatchId, selectedPathway, weights, batches, buyers]);

  const handleSimulateRequestClick = (match: MatchResult) => {
    const avgPrice = Math.round(
      (match.buyer.indicativePricePerTonneMin + match.buyer.indicativePricePerTonneMax) / 2
    );
    setOfferedPrice(avgPrice);
    setRequestTargetMatch(match);
  };

  const handleConfirmSimulatedRequest = () => {
    if (requestTargetMatch && activeBatch) {
      transactionService.createTransactionFromMatch(
        activeBatch,
        requestTargetMatch,
        proposedPickupDate,
        offeredPrice
      );
      setRequestTargetMatch(null);
      navigate('/transactions');
    }
  };

  const handleResetWeights = () => {
    const defaultW: MatchingWeights = {
      materialPathwayWeight: 35,
      quantityWeight: 20,
      qualityWeight: 20,
      distanceWeight: 15,
      economicWeight: 10,
    };
    setWeights(defaultW);
    storageService.setMatchingWeights(defaultW);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Smart Matching Engine</h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Deterministic Rules Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explainable, multi-criteria compatibility scoring without black-box machine learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWeightsOpen(!isWeightsOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              Scoring Methodology ({isWeightsOpen ? 'Hide' : 'Configure Weights'})
            </button>
            <button
              onClick={executeMatching}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Run Matching
            </button>
          </div>
        </div>

        {/* Input Controls Bar: Select Batch & Proposed Pathway */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Feedstock Batch to Evaluate:
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                const b = batches.find((item) => item.id === e.target.value);
                if (b) setSelectedPathway(b.preferredRoute);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.residueType} ({b.quantityTonnes} t, {b.district}) [{b.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Proposed Conversion / Valorization Pathway:
            </label>
            <select
              value={selectedPathway}
              onChange={(e) => setSelectedPathway(e.target.value as UtilizationPathway)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
            >
              <option value="Silica-rich ash recovery">Silica-rich ash recovery</option>
              <option value="Biochar production">Biochar production</option>
              <option value="Activated carbon production">Activated carbon production</option>
              <option value="Direct biomass energy / boiler fuel">Direct biomass energy / boiler fuel</option>
              <option value="Coir fibre & composites">Coir fibre & composites</option>
              <option value="Fibre-based paper & packaging">Fibre-based paper & packaging</option>
              <option value="Carbonaceous adsorbent production">Carbonaceous adsorbent production</option>
            </select>
          </div>
        </div>

        {/* Configurable Weights Methodology Panel */}
        {isWeightsOpen && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                Explainable Multi-Criteria Scoring Weights (Must total 100%)
              </span>
              <button
                onClick={handleResetWeights}
                className="text-[11px] text-emerald-700 font-semibold hover:underline"
              >
                Reset Default Weights
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Material & Pathway ({weights.materialPathwayWeight}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.materialPathwayWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, materialPathwayWeight: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Quantity Fit ({weights.quantityWeight}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.quantityWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, quantityWeight: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Quality & Labs ({weights.qualityWeight}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.qualityWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, qualityWeight: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Distance & Logistics ({weights.distanceWeight}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.distanceWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, distanceWeight: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">
                  Economic Margin ({weights.economicWeight}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.economicWeight}
                  onChange={(e) =>
                    setWeights({ ...weights, economicWeight: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Batch Characterization Context Pill */}
      {activeBatch && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg font-bold font-mono text-xs">
              {activeBatch.id}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">
                {activeBatch.quantityTonnes} t {activeBatch.residueType}
              </span>
              <span className="text-slate-500 ml-2">
                from {activeBatch.supplierName} ({activeBatch.district})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Moisture: {activeBatch.moisturePercent !== null ? `${activeBatch.moisturePercent}%` : 'Unmeasured'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Ash: {activeBatch.ashPercent !== null ? `${activeBatch.ashPercent}%` : 'Unmeasured'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Status: {activeBatch.status}
            </span>
          </div>
        </div>
      )}

      {/* Tabs: Eligible Matches vs Ineligible Constraints */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'eligible'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Eligible Matched Buyers ({eligibleMatches.length})
        </button>

        <button
          onClick={() => setActiveTab('ineligible')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'ineligible'
              ? 'border-red-600 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4 text-red-500" />
          Ineligible Offtakers ({ineligibleMatches.length})
        </button>
      </div>

      {/* ELIGIBLE MATCHES LIST */}
      {activeTab === 'eligible' && (
        <div className="space-y-4">
          {eligibleMatches.map((match, rank) => (
            <div
              key={match.buyer.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                {/* Left: Rank & Buyer Info */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm shadow-2xs">
                    #{rank + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {match.buyer.companyName}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {match.buyer.industryCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {match.buyer.location} • Estimated haulage: <strong>{match.distanceKm} km</strong>
                    </p>
                  </div>
                </div>

                {/* Right: Compatibility Score Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Compatibility Score
                    </span>
                    <span className="text-xl font-black text-emerald-700">
                      {match.compatibilityScore}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleSimulateRequestClick(match)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simulate Buyer Request
                  </button>
                </div>
              </div>

              {/* Economic Breakdown Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Gross Est. Value</span>
                  <p className="font-bold text-slate-900 text-sm">
                    ₹{match.potentialGrossValue?.toLocaleString('en-IN') || 'N/A'}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    @ ~₹{((match.buyer.indicativePricePerTonneMin + match.buyer.indicativePricePerTonneMax) / 2).toLocaleString('en-IN')}/t
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Est. Transport Cost</span>
                  <p className="font-bold text-slate-700 text-sm">
                    -₹{match.estimatedTransportCost?.toLocaleString('en-IN') || 'N/A'}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {match.distanceKm} km haulage
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Est. Processing Cost</span>
                  <p className="font-bold text-slate-700 text-sm">
                    -₹{match.estimatedProcessingCost?.toLocaleString('en-IN') || 'N/A'}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    conversion step
                  </span>
                </div>

                <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold">Net Simulated Value</span>
                  <p className="font-bold text-emerald-900 text-sm">
                    ₹{match.potentialNetValue?.toLocaleString('en-IN') || 'N/A'}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Simulated margin
                  </span>
                </div>
              </div>

              {/* Detailed Score Weights Breakdown */}
              <div className="grid grid-cols-5 gap-2 text-[11px] text-slate-600 pt-1">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Material Fit</span>
                  <strong className="text-slate-800">{match.breakdown.materialPathwayScore}/100</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Quantity Fit</span>
                  <strong className="text-slate-800">{match.breakdown.quantityScore}/100</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Quality Fit</span>
                  <strong className="text-slate-800">{match.breakdown.qualityScore}/100</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Logistics Fit</span>
                  <strong className="text-slate-800">{match.breakdown.distanceScore}/100</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Economics</span>
                  <strong className="text-slate-800">{match.breakdown.economicScore}/100</strong>
                </div>
              </div>

              {/* Match Highlights & Warnings */}
              <div className="space-y-1.5 text-xs">
                {match.matchHighlights.map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}

                {match.warnings.map((wn, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{wn}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {eligibleMatches.length === 0 && (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="font-bold text-slate-800">No Eligible Matches Found</h4>
              <p className="text-xs max-w-md mx-auto">
                All network buyers failed mandatory constraints for this specific batch or pathway combination. Switch to the "Ineligible Offtakers" tab to review exact constraint failure reasons.
              </p>
            </div>
          )}
        </div>
      )}

      {/* INELIGIBLE MATCHES LIST WITH EXPLICIT REJECTION REASONS */}
      {activeTab === 'ineligible' && (
        <div className="space-y-3">
          {ineligibleMatches.map((match) => (
            <div
              key={match.buyer.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 text-xs opacity-90 hover:opacity-100 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{match.buyer.companyName}</h4>
                  <span className="text-[11px] text-slate-500">
                    {match.buyer.industryCategory} • {match.buyer.location}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                  Ineligible (Fails Hard Constraints)
                </span>
              </div>

              {/* Specific Rejection Reasons */}
              <div className="p-2.5 bg-red-50/70 rounded-lg border border-red-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
                  Mandatory Constraint Violations:
                </span>
                {match.rejectionReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-red-900 text-[11px]">
                    <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SIMULATE BUYER REQUEST MODAL */}
      {requestTargetMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Simulate Buyer Purchase Request
            </h3>
            <p className="text-slate-500 mb-4">
              Submit an indicative purchase offer from {requestTargetMatch.buyer.companyName}
            </p>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1 mb-4">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Selected Batch</span>
              <p className="font-bold text-slate-900">
                {activeBatch.id}: {activeBatch.quantityTonnes} t of {activeBatch.residueType}
              </p>
              <p className="text-slate-600 text-[11px]">
                Supplier: {activeBatch.supplierName} ({activeBatch.district})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Agreed Demo Price / Tonne (INR ₹)
                </label>
                <input
                  type="number"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400">
                  Buyer range: ₹{requestTargetMatch.buyer.indicativePricePerTonneMin} - ₹{requestTargetMatch.buyer.indicativePricePerTonneMax}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Proposed Pickup Date
                </label>
                <input
                  type="date"
                  value={proposedPickupDate}
                  onChange={(e) => setProposedPickupDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 text-[11px] leading-relaxed">
                Notice: Simulated transaction for Anurag University prototype demonstration. No real financial transaction will occur.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRequestTargetMatch(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSimulatedRequest}
                className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs"
              >
                Confirm Simulated Request →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
