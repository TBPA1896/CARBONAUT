import React from 'react';
import {
  Info,
  GraduationCap,
  Users,
  Compass,
  Layers,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const ProjectInfoPage: React.FC = () => {
  const teamMembers = [
    { name: 'Laasya Kondoori', role: 'System Architecture & Knowledge Base' },
    { name: 'T. Bhavya Shree', role: 'Feedstock Characterization & Lab Profiles' },
    { name: 'K. Tanishka Reddy', role: 'Multi-Criteria Rules & Scoring Design' },
    { name: 'B. Parameswaran', role: 'Full-Stack Development & State Engineering' },
    { name: 'K. Chumanesh', role: 'Logistics Aggregation & Verification Workflows' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-7 rounded-2xl shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
            <GraduationCap className="w-4 h-4" />
            Problem Solving in Engineering — I (PSE External Project)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            AI-Driven Biomass Valorization Platform
          </h1>
          <p className="text-emerald-300 font-mono text-sm">
            Product Module: Biomass Value Match
          </p>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed pt-1">
            An academic software prototype designed at Anurag University to bridge information asymmetry and coordination gaps across agricultural residue valorization supply chains in Telangana.
          </p>
        </div>
      </div>

      {/* Team & Guide Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Project Team & Academic Guidance</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Anurag University, Hyderabad
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Team Members List */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
              Student Project Contributors:
            </span>
            <div className="space-y-1.5">
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-900">{member.name}</span>
                  <span className="text-[11px] text-slate-500">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Guide & Institution */}
          <div className="space-y-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div>
              <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block">
                Project Guide:
              </span>
              <p className="text-base font-bold text-slate-900 mt-0.5">Shilpa Shesham</p>
              <p className="text-xs text-slate-600">Department of Engineering, Anurag University</p>
            </div>

            <div className="pt-2 border-t border-emerald-100 text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <p>
                <strong>Course Context:</strong> Problem Solving in Engineering — I (PSE-I).
              </p>
              <p>
                <strong>Evaluation Scope:</strong> External Project presentation and interactive prototype demonstration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Boundary & Engineering Scope */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            System Boundary Definition
          </h2>
          <p className="text-xs text-slate-500">
            Explicit demarcation of the digital coordination system vs. physical industrial transformation
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-700">
            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-semibold">
              1. Residue Generation
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-semibold">
              2. Batch Characterization
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-semibold">
              3. Pathway Routing
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-semibold">
              4. Rules-Based Matching
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-semibold">
              5. Logistics Dispatch
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs font-semibold">
              6. End-Use Verification
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            <strong>Problem Statement:</strong> India generates over 500 million tonnes of agricultural residues annually. In Telangana alone, substantial volumes of paddy straw, rice husks, and corn cobs are sub-optimally handled due to three core friction points:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
            <li><strong>Information Asymmetry:</strong> Farmers and millers lack visibility into which regional industries pay premium rates for specific biomass properties (e.g. silica processors paying for high-ash husk).</li>
            <li><strong>Batch Uncertainty:</strong> Agro-processing residues vary in moisture and contaminants, leading industrial buyers to reject loads at the gate.</li>
            <li><strong>Logistical Inefficiencies:</strong> Smallholder quantities (15–30 tonnes) incur disproportionately high haulage costs without coordinated load aggregation.</li>
          </ul>
        </div>
      </div>

      {/* Methodology & Academic Transparency */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-700" />
            Methodology: Explainable Rules-Based Decision Engine
          </h2>
          <p className="text-xs text-slate-500">
            Why deterministic multi-criteria scoring was chosen over black-box machine learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Multi-Criteria Weight Distribution
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>Material & Pathway Acceptance</span>
                <strong>35% Weight</strong>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>Batch Quantity Fit (Window Match)</span>
                <strong>20% Weight</strong>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>Moisture & Laboratory Assay Fit</span>
                <strong>20% Weight</strong>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>Distance & Haulage Economics</span>
                <strong>15% Weight</strong>
              </div>
              <div className="flex justify-between p-1.5 bg-white rounded border border-slate-100">
                <span>Indicative Net Margin Margin</span>
                <strong>10% Weight</strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Hard Constraint Filtering
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Unlike a neural network that might rank an incompatible buyer with a low probability, this platform executes strict boolean gating:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
              <li>If buyer does not accept the material: <strong>Ineligible</strong>.</li>
              <li>If batch moisture exceeds buyer ceiling: <strong>Ineligible</strong>.</li>
              <li>If transport distance exceeds maximum radius: <strong>Ineligible</strong>.</li>
              <li>If moisture is unmeasured: <strong>Provisional match flag displayed</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Honest Academic Limitations & Disclaimers */}
      <div className="bg-amber-50/80 rounded-2xl p-6 border border-amber-200 shadow-2xs space-y-3 text-xs text-amber-950">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Academic Limitations & Simulation Disclaimers
        </div>
        <p className="leading-relaxed">
          <strong>Software Proof-of-Concept Only:</strong> This application is a decision-support prototype. It does not operate a physical chemical refining plant, contact real industrial entities, or execute real bank payments.
        </p>
        <p className="leading-relaxed">
          <strong>No Unsupported Environmental Claims:</strong> The application does not claim to have scientifically eliminated crop residue burning or created carbon credits. All carbon yields and silica purities are educational references derived from published academic literature, not empirical field trials.
        </p>
      </div>
    </div>
  );
};
