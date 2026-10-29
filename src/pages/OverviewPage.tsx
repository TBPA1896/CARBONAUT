import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Boxes,
  Building2,
  CheckCircle2,
  IndianRupee,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Filter,
  Check,
  ChevronRight,
  Layers,
  FlaskConical,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { analyticsService, AnalyticsSummary } from '../services/analyticsService';
import { residueService } from '../services/residueService';
import { buyerService } from '../services/buyerService';
import { matchingEngine } from '../services/matchingEngine';
import { storageService } from '../services/storageService';
import { ResidueBatch, MatchResult } from '../types';

const COLORS = ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#65a30d', '#ca8a04', '#0d9488', '#0284c7'];

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [batches, setBatches] = useState<ResidueBatch[]>([]);
  const [selectedResidueFilter, setSelectedResidueFilter] = useState('All');
  const [topMatches, setTopMatches] = useState<{ batch: ResidueBatch; match: MatchResult }[]>([]);

  const loadData = () => {
    const summary = analyticsService.getAnalyticsData();
    setAnalytics(summary);
    const allBatches = residueService.getAllBatches();
    setBatches(allBatches);

    // Compute top recommended matches dynamically
    const allBuyers = buyerService.getAllBuyers();
    const weights = storageService.getMatchingWeights();
    const recommendations: { batch: ResidueBatch; match: MatchResult }[] = [];

    // Find best match for first few available batches
    const available = allBatches.filter((b) => b.status === 'Available').slice(0, 5);
    available.forEach((batch) => {
      const matchEval = matchingEngine.matchBatchWithAllBuyers(batch, allBuyers, batch.preferredRoute, weights);
      if (matchEval.eligible.length > 0) {
        recommendations.push({
          batch,
          match: matchEval.eligible[0],
        });
      }
    });
    setTopMatches(recommendations);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bvm_storage_update', loadData);
    return () => window.removeEventListener('bvm_storage_update', loadData);
  }, []);

  if (!analytics) return null;

  // Filter supply data if user selects a specific residue
  const filteredSupplyByType =
    selectedResidueFilter === 'All'
      ? analytics.supplyByType
      : analytics.supplyByType.filter((s) => s.name === selectedResidueFilter);

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              PSE-I External Project • Anurag University
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Biomass Value Match — Decision Support System
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Software prototype demonstrating agro-residue characterization, explainable rules-based buyer matching, and circular valorization routing across Telangana.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/matching"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              Run Matching Engine
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-300/80">
          <span>Notice: All metrics, buyer profiles, and indicative prices are simulated for academic demonstration.</span>
          <span className="font-mono">Local Rules Engine v1.0</span>
        </div>
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Residue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Residue</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {analytics.availableResidueTonnes.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">t</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{analytics.totalResidueTonnes} t total</span>
            <span>in system</span>
          </div>
        </div>

        {/* Card 2: Listed Batches */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Listed Batches</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.totalBatchesCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-blue-700 font-semibold">{analytics.availableBatchesCount} open</span> for matching
          </div>
        </div>

        {/* Card 3: Potential Buyers */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Buyer Network</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.totalBuyersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-purple-700 font-semibold">{analytics.activeBuyersCount} active</span> industrial plants
          </div>
        </div>

        {/* Card 4: Successful Matches */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Simulated Matches</span>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.matchedBatchesCount}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            {analytics.matchAcceptanceRatePercent}% acceptance rate
          </div>
        </div>

        {/* Card 5: Estimated Value */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Matched Value</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{(analytics.totalEstimatedValueInr / 100000).toFixed(1)}{' '}
            <span className="text-sm font-normal text-slate-500">Lakh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gross simulated value
          </div>
        </div>

        {/* Card 6: Awaiting Collection */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Haulage</span>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.awaitingCollectionCount}</div>
          <div className="text-[11px] text-orange-700 font-medium mt-1">
            Batches in logistics queue
          </div>
        </div>
      </div>

      {/* Supply-to-Demand Flow Visualization Schematic */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              Circular Supply-to-Demand Routing Schematic
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing how raw agro-processing streams convert through valorization pathways into industrial end-uses
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Explainable Decision Flow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Stage 1: Residue Sources */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              1. Residue Feedstocks
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Rice Husk & Straw</span>
                <strong className="text-slate-800">42% supply</strong>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Coconut Shell & Husk</span>
                <strong className="text-slate-800">18% supply</strong>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Groundnut & Maize Cobs</span>
                <strong className="text-slate-800">24% supply</strong>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Bagasse & Wheat Straw</span>
                <strong className="text-slate-800">16% supply</strong>
              </div>
            </div>
          </div>

          {/* Stage 2: Characterization & Lab Testing */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-700" />
              2. Lab Characterization
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="p-2 bg-white rounded border border-emerald-100">
                <span className="font-medium text-slate-800">Moisture & Ash Check</span>
                <p className="text-[10px] text-slate-500">Flags provisional matches if unverified</p>
              </div>
              <div className="p-2 bg-white rounded border border-emerald-100">
                <span className="font-medium text-slate-800">Fixed Carbon Assay</span>
                <p className="text-[10px] text-slate-500">Filters activated carbon suitability</p>
              </div>
              <div className="p-2 bg-white rounded border border-emerald-100">
                <span className="font-medium text-slate-800">Contamination Level</span>
                <p className="text-[10px] text-slate-500">Low, moderate, or rejected</p>
              </div>
            </div>
          </div>

          {/* Stage 3: Conversion Pathways */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2">
            <div className="font-bold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              3. Processing Pathways
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="p-2 bg-white rounded border border-blue-100">
                <span className="font-semibold text-blue-900">Silica Ash Recovery</span>
                <p className="text-[10px] text-slate-500">Fluidized bed calcination (mineral)</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-100">
                <span className="font-semibold text-blue-900">Slow Pyrolysis / Biochar</span>
                <p className="text-[10px] text-slate-500">Oxygen-starved retorts (carbon)</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-100">
                <span className="font-semibold text-blue-900">Steam Activation / AC</span>
                <p className="text-[10px] text-slate-500">High-iodine filtration carbons</p>
              </div>
            </div>
          </div>

          {/* Stage 4: Industrial Offtakers */}
          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-2">
            <div className="font-bold text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              4. Industry Offtakers
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="p-2 bg-white rounded border border-purple-100 flex justify-between">
                <span>Green Silica & Tires</span>
                <strong className="text-purple-900">₹4,200 - ₹5,400/t</strong>
              </div>
              <div className="p-2 bg-white rounded border border-purple-100 flex justify-between">
                <span>Water Filtration (AC)</span>
                <strong className="text-purple-900">₹11,500 - ₹14,500/t</strong>
              </div>
              <div className="p-2 bg-white rounded border border-purple-100 flex justify-between">
                <span>Soil Regeneration</span>
                <strong className="text-purple-900">₹2,800 - ₹3,800/t</strong>
              </div>
              <div className="p-2 bg-white rounded border border-purple-100 flex justify-between">
                <span>Thermal Co-firing</span>
                <strong className="text-purple-900">₹2,200 - ₹3,100/t</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid: Supply by Type & Industry Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply by Type Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Residue Supply by Type (Tonnes)</h3>
              <p className="text-xs text-slate-500">Aggregated from current listed inventory batches</p>
            </div>
            {/* Filter dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedResidueFilter}
                onChange={(e) => setSelectedResidueFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700"
              >
                <option value="All">All Residues</option>
                {analytics.supplyByType.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredSupplyByType} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Tonnes`, 'Supply Volume']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="tonnes" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Demand Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Industry Demand & Intake Capacity</h3>
              <p className="text-xs text-slate-500">Maximum intake capacity by industrial buyer category</p>
            </div>
            <Link to="/buyers" className="text-xs text-emerald-700 font-semibold hover:underline">
              View All Buyers →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.demandByIndustry} layout="vertical" margin={{ top: 5, right: 15, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="industry"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={130}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} Tonnes/batch`, 'Max Capacity']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="capacityTonnes" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommended Matches Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recommended Buyer Matches (Explainable Engine)</h3>
            <p className="text-xs text-slate-500">
              Evaluated using multi-criteria weighted scoring (Material 35%, Quantity 20%, Quality 20%, Distance 15%, Economics 10%)
            </p>
          </div>
          <Link
            to="/matching"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Open Matching Console
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Batch ID / Residue</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Best Matched Buyer</th>
                <th className="py-2.5 px-3">Target Industry</th>
                <th className="py-2.5 px-3 text-center">Score</th>
                <th className="py-2.5 px-3 text-right">Potential Gross</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topMatches.map(({ batch, match }) => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{batch.id}</span>
                    <div className="text-[11px] text-slate-500">{batch.residueType}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{batch.district}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{batch.quantityTonnes} t</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-emerald-800">{match.buyer.companyName}</div>
                    <div className="text-[10px] text-slate-400">{match.distanceKm} km away</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                      {match.buyer.industryCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                      {match.compatibilityScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-800">
                    ₹{match.potentialGrossValue?.toLocaleString('en-IN') || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate('/matching', { state: { selectedBatchId: batch.id } })}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-700 border border-emerald-200 rounded-lg transition"
                    >
                      Inspect Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
