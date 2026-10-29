import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  Scale,
  Boxes,
  Building2,
  TrendingUp,
  Percent,
  Truck,
  Layers,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
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
  AreaChart,
  Area,
} from 'recharts';
import { analyticsService, AnalyticsSummary } from '../services/analyticsService';
import { exportService } from '../services/exportService';
import { residueService } from '../services/residueService';
import { transactionService } from '../services/transactionService';
import { ResetModal } from '../components/common/ResetModal';

const PIE_COLORS = ['#15803d', '#22c55e', '#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899'];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedResidueFilter, setSelectedResidueFilter] = useState('All');

  const loadData = () => {
    setAnalytics(analyticsService.getAnalyticsData());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bvm_storage_update', loadData);
    return () => window.removeEventListener('bvm_storage_update', loadData);
  }, []);

  if (!analytics) return null;

  const handleExportBatchesCsv = () => {
    exportService.exportBatchesToCsv(residueService.getAllBatches());
  };

  const handleExportTxnsCsv = () => {
    exportService.exportTransactionsToCsv(transactionService.getAllTransactions());
  };

  const filteredSupply =
    selectedResidueFilter === 'All'
      ? analytics.supplyByType
      : analytics.supplyByType.filter((s) => s.name === selectedResidueFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Analytics & Reporting</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Dynamic Aggregations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time regional biomass statistics, transaction velocity, and circular valorization metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBatchesCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Inventory CSV
            </button>
            <button
              onClick={handleExportTxnsCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Transactions CSV
            </button>
            <button
              onClick={() => setIsResetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Biomass Available
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {analytics.availableResidueTonnes.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">t</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Across {analytics.availableBatchesCount} active listings
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Match Acceptance Rate
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            {analytics.matchAcceptanceRatePercent}%
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated from recorded buyer intent
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Freight Economics
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ₹{analytics.avgTransportCostPerKgInr}{' '}
            <span className="text-sm font-normal text-slate-500">/ kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Average across regional Telangana trips
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Completed Circular Reuse
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {analytics.completedTransactionsCount}{' '}
            <span className="text-sm font-normal text-slate-500">deliveries</span>
          </div>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            End-use verified in registry
          </p>
        </div>
      </div>

      {/* Primary Charts Row 1: Supply by Type & District Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply by Type Chart with Working Filter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Residue Feedstock Supply (Tonnes)</h3>
              <p className="text-xs text-slate-500">Distribution of available agricultural residues</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedResidueFilter}
                onChange={(e) => setSelectedResidueFilter(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
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
              <BarChart data={filteredSupply} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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

        {/* Geographic Supply Distribution by District */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Regional Supply by District (Telangana)</h3>
            <p className="text-xs text-slate-500">Geographic concentration of agricultural surpluses</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.supplyByDistrict} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="district"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Tonnes`, 'District Supply']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="tonnes" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Transaction Pipeline Funnel & End-Use Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Pipeline Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Transaction Pipeline Funnel</h3>
            <p className="text-xs text-slate-500">Number of transactions by lifecycle stage</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.transactionPipeline} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Transactions`, 'Stage Count']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* End-Use Circular Products Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Verified End-Use Applications</h3>
            <p className="text-xs text-slate-500">Circularity verified at destination manufacturing units</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.endUseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="tonnes"
                  nameKey="category"
                >
                  {analytics.endUseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Tonnes`, 'Volume Verified']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onResetSuccess={loadData}
      />
    </div>
  );
};
