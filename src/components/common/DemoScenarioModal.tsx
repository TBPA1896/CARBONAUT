import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Play,
  Layers,
  Scale,
  Send,
  Truck,
  FileCheck2,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScenarioStep {
  number: number;
  title: string;
  route: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  talkingPoints: string[];
  actionLabel: string;
  actionQueryParam?: string;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps: ScenarioStep[] = [
    {
      number: 1,
      title: 'Platform Overview & Regional Biomass Supply',
      route: '/',
      badge: 'Step 1: Macro Supply',
      icon: <Layers className="w-5 h-5 text-emerald-700" />,
      summary: 'Show the overall biomass surplus across Telangana districts and review current active demand.',
      talkingPoints: [
        'Over 670+ tonnes of synthetic agricultural residues mapped across Telangana.',
        'Sankey flow diagram demonstrates how uncoordinated agro-processing residues can be channelled to high-value industrial sectors.',
        'KPI cards dynamically aggregate local data without external database latency.',
      ],
      actionLabel: 'Go to Overview Dashboard',
    },
    {
      number: 2,
      title: 'Residue Inventory & Batch Characterization',
      route: '/inventory',
      badge: 'Step 2: Feedstock Profiling',
      icon: <Scale className="w-5 h-5 text-emerald-700" />,
      summary: 'Inspect the 45-tonne Rice Husk batch from Nizamabad (BATCH-RH-2026-001).',
      talkingPoints: [
        'Observe laboratory indicators: Moisture (9.8%), Ash (18.2%), and Carbon (38.5%).',
        'Highlight the data confidence rating (High vs Provisional for missing lab fields).',
        'Show how missing measurements are flagged honestly as "Not measured" rather than fabricated.',
      ],
      actionLabel: 'Explore Residue Inventory',
    },
    {
      number: 3,
      title: 'Material Recovery Lab — Valorization Pathways',
      route: '/recovery-lab',
      badge: 'Step 3: Pathway Matrix',
      icon: <Sparkles className="w-5 h-5 text-emerald-700" />,
      summary: 'Examine different potential pathways for Rice Husk and compare Silica Recovery against Biochar.',
      talkingPoints: [
        'Distinguish Carbon Recovery (Biochar/Activated Carbon) from Mineral Recovery (Amorphous Silica Ash).',
        'Interactive side-by-side comparison reveals processing prerequisites and temperature parameters.',
        'Speculative or research routes are transparently labelled separate from established commercial pathways.',
      ],
      actionLabel: 'Open Material Recovery Lab',
    },
    {
      number: 4,
      title: 'Explainable Smart Matching Engine',
      route: '/matching',
      badge: 'Step 4: Decision Engine',
      icon: <Scale className="w-5 h-5 text-emerald-700" />,
      summary: 'Execute the 5-step rules-based algorithm on the Nizamabad Rice Husk batch.',
      talkingPoints: [
        'Deterministic evaluation: Material compatibility (35%), Quantity fit (20%), Quality (20%), Distance (15%), Economics (10%).',
        'View top eligible buyer: "Telangana Advanced Silicates Pvt. Ltd." with 94/100 score and net margin estimate.',
        'Examine ineligibility reasons for rejected buyers (e.g. moisture violation, wrong material type, or excess distance).',
      ],
      actionLabel: 'Run Smart Matching',
    },
    {
      number: 5,
      title: 'Simulate Buyer Request & Commercial Intent',
      route: '/transactions',
      badge: 'Step 5: Buyer Coordination',
      icon: <Send className="w-5 h-5 text-emerald-700" />,
      summary: 'Submit a simulated commercial request and advance status to Accepted.',
      talkingPoints: [
        'Simulated transactions capture indicative price bands (₹4,200 - ₹5,400/t) without real money transactions.',
        'Audited status history tracks each transition with timestamped operational notes.',
        'Rejection workflow demonstrated with explicit technical reasons if specifications are unmet.',
      ],
      actionLabel: 'View Transactions Desk',
    },
    {
      number: 6,
      title: 'Logistics Dispatch & Load Aggregation',
      route: '/logistics',
      badge: 'Step 6: Haulage Coordination',
      icon: <Truck className="w-5 h-5 text-emerald-700" />,
      summary: 'Coordinate 16-wheeler transport dispatch from Nizamabad to Sangareddy.',
      talkingPoints: [
        'Calculates freight economics (~₹0.49 per kg of biomass haulage).',
        'Aggregation planner allows combining multiple smallholder batches into a single legal truckload.',
        'Track status: Proposed → Scheduled → Picked Up → Delivered.',
      ],
      actionLabel: 'Open Logistics Planner',
    },
    {
      number: 7,
      title: 'End-Use Recording & Simulated Verification',
      route: '/transactions',
      badge: 'Step 7: Circularity Verification',
      icon: <FileCheck2 className="w-5 h-5 text-emerald-700" />,
      summary: 'Verify delivery at the industrial gate and attach simulated evidence.',
      talkingPoints: [
        'Simulated proof attached: Weighbridge slip #WB-8492 and kiln combustion logs.',
        'Records circular end use as "Precipitated Amorphous Silica" for green tires.',
        'Batches automatically transition from listed to delivered across the application state.',
      ],
      actionLabel: 'Verify End-Use in Transactions',
    },
    {
      number: 8,
      title: 'Live Analytics & Engineering Project Context',
      route: '/analytics',
      badge: 'Step 8: Impact & Synthesis',
      icon: <BarChart3 className="w-5 h-5 text-emerald-700" />,
      summary: 'Observe the real-time KPI updates and export full dataset to CSV.',
      talkingPoints: [
        'All statistics recalculate dynamically from local records.',
        'Legitimate acceptance rates calculated with correct denominators.',
        'Full academic context and team credits documented for Anurag University PSE-I evaluation.',
      ],
      actionLabel: 'View Live Analytics',
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleExecuteStep = () => {
    navigate(currentStep.route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 sm:pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-800 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Scenario Step {currentStep.number} of {steps.length}
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">{currentStep.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-100">
          {steps.map((step, idx) => (
            <button
              key={step.number}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-8 bg-emerald-600'
                  : idx < currentStepIndex
                  ? 'w-3 bg-emerald-200 hover:bg-emerald-300'
                  : 'w-3 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Step ${step.number}: ${step.title}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto grow">
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-xs mt-0.5">{currentStep.icon}</div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {currentStep.badge}
              </span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{currentStep.summary}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Key Presentation Talking Points (Anurag University Defense)
            </h4>
            <div className="space-y-2">
              {currentStep.talkingPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-slate-100 pt-3 sm:pt-4 mt-2">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                currentStepIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200'
                  : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              disabled={currentStepIndex === steps.length - 1}
              onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                currentStepIndex === steps.length - 1
                  ? 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200'
                  : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExecuteStep}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition w-full sm:w-auto"
          >
            <Play className="w-4 h-4 fill-white shrink-0" />
            {currentStep.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
