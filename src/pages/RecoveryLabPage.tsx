import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Check,
  Flame,
  Leaf,
  Filter,
} from 'lucide-react';
import { recoveryService } from '../services/recoveryService';
import { residueService } from '../services/residueService';
import { buyerService } from '../services/buyerService';
import { ResidueType, PathwayDetail, ResidueBatch, BuyerProfile } from '../types';

export const RecoveryLabPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const allResidueTypes = recoveryService.getAllResidueTypes();
  const allBatches = residueService.getAllBatches();
  const allBuyers = buyerService.getAllBuyers();

  // Active selections
  const [selectedResidueType, setSelectedResidueType] = useState<ResidueType>('Rice husk');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('BATCH-RH-2026-001');
  const [activePathwayId, setActivePathwayId] = useState<string>('PW-RH-01');

  // Side-by-side comparison state
  const [isComparing, setIsComparing] = useState<boolean>(true);
  const [comparisonPathwayId, setComparisonPathwayId] = useState<string>('PW-RH-02');

  const selectedBatch = allBatches.find((b) => b.id === selectedBatchId) || allBatches[0];
  const pathwaysForResidue = recoveryService.getPathwaysForResidue(selectedResidueType);

  const activePathway =
    pathwaysForResidue.find((p) => p.id === activePathwayId) || pathwaysForResidue[0];
  const comparisonPathway =
    pathwaysForResidue.find((p) => p.id === comparisonPathwayId) ||
    (pathwaysForResidue[1] ? pathwaysForResidue[1] : pathwaysForResidue[0]);

  // When user changes residue type, select its first pathway
  const handleResidueChange = (type: ResidueType) => {
    setSelectedResidueType(type);
    const newPathways = recoveryService.getPathwaysForResidue(type);
    if (newPathways.length > 0) {
      setActivePathwayId(newPathways[0].id);
      if (newPathways.length > 1) {
        setComparisonPathwayId(newPathways[1].id);
      } else {
        setComparisonPathwayId(newPathways[0].id);
      }
    }
    // Update batch selection to match residue type if available
    const matchingBatch = allBatches.find((b) => b.residueType === type);
    if (matchingBatch) setSelectedBatchId(matchingBatch.id);
  };

  // Find buyers in the demo network that accept this pathway
  const matchingBuyers = allBuyers.filter(
    (b) =>
      b.preferredResidues.includes(selectedResidueType) &&
      b.acceptedPathways.includes(activePathway?.pathwayName)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Material Recovery Lab</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Key Differentiator
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Scientific pathways mapping: Distinguish carbonaceous recovery (biochar, activated carbon) from mineral recovery (biogenic silica)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComparing(!isComparing)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                isComparing
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isComparing ? 'Hide Side-by-Side Comparison' : 'Compare Two Pathways'}
            </button>
          </div>
        </div>

        {/* Residue Selector Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Feedstock Stream to Inspect Pathways:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {allResidueTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleResidueChange(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedResidueType === type
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Batch Context Bar */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-2xs text-emerald-700">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Active Inventory Batch Context
            </span>
            <div className="font-bold text-slate-900 mt-0.5">
              {selectedBatch.id} • {selectedBatch.quantityTonnes} Tonnes from {selectedBatch.supplierName} ({selectedBatch.district})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <span>
            Moisture:{' '}
            <strong className="text-slate-800">
              {selectedBatch.moisturePercent !== null ? `${selectedBatch.moisturePercent}%` : 'Not measured'}
            </strong>
          </span>
          <span>•</span>
          <span>
            Ash:{' '}
            <strong className="text-slate-800">
              {selectedBatch.ashPercent !== null ? `${selectedBatch.ashPercent}%` : 'Not measured'}
            </strong>
          </span>
          <span>•</span>
          <span>
            Carbon:{' '}
            <strong className="text-slate-800">
              {selectedBatch.carbonContentPercent !== null ? `${selectedBatch.carbonContentPercent}%` : 'Not measured'}
            </strong>
          </span>
        </div>
      </div>

      {/* VISUAL PATHWAY FLOW: Residue → Processing route → Recovered product → Industry → Potential buyer */}
      {activePathway && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                End-to-End Route Visualization
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {activePathway.pathwayName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {activePathway.isMineralRecovery && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Mineral Recovery (Non-Carbon)
                </span>
              )}
              {activePathway.isCarbonRecovery && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  Carbonaceous Recovery
                </span>
              )}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  activePathway.technologicalReadiness === 'Established Commercial'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {activePathway.technologicalReadiness}
              </span>
            </div>
          </div>

          {/* Stepper Chevron Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Step 1: Raw Residue */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                1. Raw Feedstock
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{selectedResidueType}</h4>
              <p className="text-[11px] text-slate-500">
                Batch {selectedBatch.id} ({selectedBatch.quantityTonnes} t)
              </p>
            </div>

            {/* Step 2: Processing Route */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                2. Processing Route
              </span>
              <h4 className="font-bold text-emerald-950 text-sm leading-tight">
                {activePathway.pathwayName}
              </h4>
              <p className="text-[10px] text-emerald-800 leading-snug">
                Est. Processing Cost: ₹{activePathway.indicativeProcessingCostPerTonne.toLocaleString('en-IN')}/t
              </p>
            </div>

            {/* Step 3: Recovered Product */}
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                3. Recovered Product
              </span>
              <h4 className="font-bold text-blue-950 text-sm leading-tight">
                {activePathway.recoveredProduct}
              </h4>
              <p className="text-[10px] text-blue-700">
                High commercial purity grade
              </p>
            </div>

            {/* Step 4: Industry */}
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
              <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                4. Target Industry
              </span>
              <h4 className="font-bold text-purple-950 text-sm leading-tight">
                {activePathway.targetIndustries[0]}
              </h4>
              <p className="text-[10px] text-purple-700">
                +{activePathway.targetIndustries.length - 1} related sectors
              </p>
            </div>

            {/* Step 5: Matching Buyer */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                5. Demo Offtaker
              </span>
              <h4 className="font-bold text-amber-950 text-sm leading-tight">
                {matchingBuyers.length > 0 ? matchingBuyers[0].companyName : 'Consolidated Market'}
              </h4>
              <p className="text-[10px] text-amber-800">
                {matchingBuyers.length} eligible plants in network
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Scientific Context: </strong>
            {activePathway.description}
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE PATHWAY COMPARISON MATRIX */}
      {isComparing && activePathway && comparisonPathway && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Comparative Valorization Matrix
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                Side-by-Side Pathway Evaluation: {selectedResidueType}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <span className="text-slate-500 mr-2">Compare Pathway A:</span>
                <select
                  value={activePathwayId}
                  onChange={(e) => setActivePathwayId(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
                >
                  {pathwaysForResidue.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pathwayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs">
                <span className="text-slate-500 mr-2">Against Pathway B:</span>
                <select
                  value={comparisonPathwayId}
                  onChange={(e) => setComparisonPathwayId(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
                >
                  {pathwaysForResidue.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pathwayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2-Column Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Pathway A */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Pathway A (Selected)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {activePathway.technologicalReadiness}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{activePathway.pathwayName}</h4>
                <p className="text-slate-600 text-xs mt-1">{activePathway.recoveredProduct}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Required Processing:</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{activePathway.requiredProcessing}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Key Quality Specifications:</span>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                    {activePathway.keyQualityChecks.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Technical Prerequisites:</span>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                    {activePathway.technicalPrerequisites.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 flex items-center justify-between">
                  <span className="text-slate-600">Simulated Processing Cost:</span>
                  <strong className="text-slate-900">
                    ₹{activePathway.indicativeProcessingCostPerTonne.toLocaleString('en-IN')} / tonne
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate('/matching', {
                        state: {
                          selectedBatchId: selectedBatch.id,
                          selectedPathway: activePathway.pathwayName,
                        },
                      })
                    }
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-center transition"
                  >
                    Match Buyers for Pathway A →
                  </button>
                </div>
              </div>
            </div>

            {/* Pathway B */}
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                  Pathway B (Comparative)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {comparisonPathway.technologicalReadiness}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{comparisonPathway.pathwayName}</h4>
                <p className="text-slate-600 text-xs mt-1">{comparisonPathway.recoveredProduct}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-blue-100">
                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Required Processing:</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{comparisonPathway.requiredProcessing}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Key Quality Specifications:</span>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                    {comparisonPathway.keyQualityChecks.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Technical Prerequisites:</span>
                  <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                    {comparisonPathway.technicalPrerequisites.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-blue-100 flex items-center justify-between">
                  <span className="text-slate-600">Simulated Processing Cost:</span>
                  <strong className="text-slate-900">
                    ₹{comparisonPathway.indicativeProcessingCostPerTonne.toLocaleString('en-IN')} / tonne
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate('/matching', {
                        state: {
                          selectedBatchId: selectedBatch.id,
                          selectedPathway: comparisonPathway.pathwayName,
                        },
                      })
                    }
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-center transition"
                  >
                    Match Buyers for Pathway B →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Offtakers Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Prospective Industrial Offtakers for {activePathway?.pathwayName}
            </h3>
            <p className="text-xs text-slate-500">
              Demo buyer entities in Telangana accepting this valorization route
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {matchingBuyers.length} Buyers Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {matchingBuyers.map((b) => (
            <div key={b.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{b.companyName}</h4>
                  <span className="text-[10px] text-slate-500">{b.location}</span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {b.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                {b.processingCapabilities}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                <span>Indicative: ₹{b.indicativePricePerTonneMin} - ₹{b.indicativePricePerTonneMax}/t</span>
                <span className="font-medium text-emerald-700">{b.distanceFromHubKm} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
