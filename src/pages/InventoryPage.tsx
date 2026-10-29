import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  X,
  Scale,
  FlaskConical,
} from 'lucide-react';
import { residueService, BatchFilterOptions } from '../services/residueService';
import { exportService } from '../services/exportService';
import { ResidueBatch, BatchStatus, ResidueType, ContaminationLevel, StorageCondition } from '../types';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<ResidueBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ResidueBatch | null>(null);
  const [editingBatch, setEditingBatch] = useState<ResidueBatch | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<ResidueBatch | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [residueTypeFilter, setResidueTypeFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'quantity' | 'date' | 'distance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadBatches = () => {
    const data = residueService.getAllBatches();
    setBatches(data);
  };

  useEffect(() => {
    loadBatches();
    window.addEventListener('bvm_storage_update', loadBatches);
    return () => window.removeEventListener('bvm_storage_update', loadBatches);
  }, []);

  // Filter & sort logic
  const filtered = residueService.filterBatches(batches, {
    searchQuery,
    residueType: residueTypeFilter,
    district: districtFilter,
    status: statusFilter,
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'quantity') {
      comparison = a.quantityTonnes - b.quantityTonnes;
    } else if (sortBy === 'distance') {
      comparison = a.estimatedCollectionDistanceKm - b.estimatedCollectionDistanceKm;
    } else {
      comparison = new Date(a.availableDate).getTime() - new Date(b.availableDate).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const uniqueDistricts = Array.from(new Set(batches.map((b) => b.district))).sort();
  const uniqueTypes = Array.from(new Set(batches.map((b) => b.residueType))).sort();

  const handleStatusChange = (batchId: string, newStatus: BatchStatus) => {
    residueService.updateBatchStatus(batchId, newStatus);
    loadBatches();
  };

  const handleDeleteConfirm = () => {
    if (batchToDelete) {
      residueService.deleteBatch(batchToDelete.id);
      setBatchToDelete(null);
      loadBatches();
    }
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBatch) {
      residueService.updateBatch(editingBatch);
      setEditingBatch(null);
      loadBatches();
    }
  };

  const handleExportCsv = () => {
    exportService.exportBatchesToCsv(sorted);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-700" />
            Residue Inventory
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {sorted.length} Batches Listed
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized agricultural and agro-processing residues across Telangana
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Download CSV report of current inventory"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <Link
            to="/add-batch"
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Batch
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, supplier, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Residue Type filter */}
          <div>
            <select
              value={residueTypeFilter}
              onChange={(e) => setResidueTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Residue Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* District filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Districts</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Under Review">Under Review</option>
              <option value="Matched">Matched</option>
              <option value="Pickup Scheduled">Pickup Scheduled</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'quantity') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                else {
                  setSortBy('quantity');
                  setSortOrder('desc');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium border ${
                sortBy === 'quantity' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              Quantity {sortBy === 'quantity' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'distance') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                else {
                  setSortBy('distance');
                  setSortOrder('asc');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium border ${
                sortBy === 'distance' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              Distance {sortBy === 'distance' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'date') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              className={`px-2 py-0.5 rounded font-medium border ${
                sortBy === 'date' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              Available Date {sortBy === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>
          <span className="text-[11px] text-slate-400">
            Showing {sorted.length} of {batches.length} synthetic records
          </span>
        </div>
      </div>

      {/* MOBILE ADAPTIVE VIEW (Screens < md) */}
      <div className="md:hidden space-y-3">
        {sorted.map((batch) => (
          <div
            key={`mobile-${batch.id}`}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
          >
            {/* Top row: ID, Date & Status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-slate-900 text-xs">{batch.id}</span>
                <span className="text-[10px] text-slate-400 block">Available: {batch.availableDate}</span>
              </div>
              <select
                value={batch.status}
                onChange={(e) => handleStatusChange(batch.id, e.target.value as BatchStatus)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border focus:outline-none ${
                  batch.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : batch.status === 'Matched'
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : batch.status === 'Pickup Scheduled'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : batch.status === 'Delivered'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <option value="Available">Available</option>
                <option value="Under Review">Under Review</option>
                <option value="Matched">Matched</option>
                <option value="Pickup Scheduled">Pickup Scheduled</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* Material & Supplier Info */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">{batch.residueType}</h4>
                <span className="font-black text-emerald-800 text-sm">{batch.quantityTonnes} Tonnes</span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {batch.supplierName} • {batch.district} ({batch.estimatedCollectionDistanceKm} km)
              </p>
              <div className="mt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 inline-block">
                  Route: {batch.preferredRoute}
                </span>
              </div>
            </div>

            {/* Quality Assay Indicators */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-lg text-center text-[10px]">
              <div>
                <span className="text-slate-400 block">Moisture</span>
                <strong className="text-slate-800">
                  {batch.moisturePercent !== null ? `${batch.moisturePercent}%` : 'Unmeasured'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Ash</span>
                <strong className="text-slate-800">
                  {batch.ashPercent !== null ? `${batch.ashPercent}%` : 'Unmeasured'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Carbon</span>
                <strong className="text-slate-800">
                  {batch.carbonContentPercent !== null ? `${batch.carbonContentPercent}%` : 'Unmeasured'}
                </strong>
              </div>
            </div>

            {/* Confidence & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                {batch.dataConfidence === 'High' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Labs
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3" />
                    Provisional
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedBatch(batch)}
                  className="px-2 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                >
                  Details
                </button>
                <button
                  onClick={() =>
                    navigate('/matching', { state: { selectedBatchId: batch.id } })
                  }
                  className="px-2.5 py-1 text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs font-bold"
                >
                  Match
                </button>
                <button
                  onClick={() => setEditingBatch({ ...batch })}
                  className="p-1 text-slate-400 hover:text-blue-700 rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBatchToDelete(batch)}
                  className="p-1 text-slate-400 hover:text-red-700 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP BATCH RECORDS TABLE (Screens >= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Residue Type</th>
                <th className="py-3 px-4">Supplier & Location</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Quality Lab Assay</th>
                <th className="py-3 px-4">Data Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/70 transition">
                  {/* Batch ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {batch.id}
                    <div className="text-[10px] text-slate-400 font-sans font-normal">
                      Avail: {batch.availableDate}
                    </div>
                  </td>

                  {/* Residue Type */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">{batch.residueType}</span>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      Route: {batch.preferredRoute}
                    </div>
                  </td>

                  {/* Supplier & Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{batch.supplierName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {batch.location}, {batch.district} ({batch.estimatedCollectionDistanceKm} km)
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-slate-900 text-sm">{batch.quantityTonnes} t</span>
                    <div className="text-[10px] text-slate-400">{batch.quantityKg.toLocaleString()} kg</div>
                  </td>

                  {/* Quality Lab Assay */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <span>
                        Moisture:{' '}
                        {batch.moisturePercent !== null ? (
                          <strong className="text-slate-800">{batch.moisturePercent}%</strong>
                        ) : (
                          <span className="text-amber-700 italic">Not measured</span>
                        )}
                      </span>
                      <span>
                        Ash:{' '}
                        {batch.ashPercent !== null ? (
                          <strong className="text-slate-800">{batch.ashPercent}%</strong>
                        ) : (
                          <span className="text-slate-400">Not measured</span>
                        )}
                      </span>
                      <span>
                        Carbon:{' '}
                        {batch.carbonContentPercent !== null ? (
                          <strong className="text-slate-800">{batch.carbonContentPercent}%</strong>
                        ) : (
                          <span className="text-slate-400">Not measured</span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Data Confidence Indicator */}
                  <td className="py-3.5 px-4">
                    {batch.dataConfidence === 'High' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Labs
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800" title="Missing moisture or proximate ash/carbon tests">
                        <AlertTriangle className="w-3 h-3" />
                        Provisional (Missing Labs)
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={batch.status}
                      onChange={(e) => handleStatusChange(batch.id, e.target.value as BatchStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none ${
                        batch.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : batch.status === 'Matched'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : batch.status === 'Pickup Scheduled'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : batch.status === 'Delivered'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Matched">Matched</option>
                      <option value="Pickup Scheduled">Pickup Scheduled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingBatch({ ...batch })}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Batch"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          navigate('/matching', { state: { selectedBatchId: batch.id } })
                        }
                        className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition font-semibold"
                        title="Match Buyers"
                      >
                        <FlaskConical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setBatchToDelete(batch)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW BATCH DETAILS MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedBatch.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {selectedBatch.status}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {selectedBatch.residueType} Feedstock
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Origin: {selectedBatch.supplierName} • {selectedBatch.supplierType}
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Quantity</span>
                  <p className="text-base font-bold text-slate-800">{selectedBatch.quantityTonnes} Tonnes</p>
                  <p className="text-[11px] text-slate-500">({selectedBatch.quantityKg.toLocaleString()} kg)</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Location</span>
                  <p className="font-semibold text-slate-800">{selectedBatch.district}, Telangana</p>
                  <p className="text-[11px] text-slate-500">{selectedBatch.estimatedCollectionDistanceKm} km from hub</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Laboratory Analysis & Physical State
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400">Moisture</span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedBatch.moisturePercent !== null ? `${selectedBatch.moisturePercent}%` : 'Not measured'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400">Ash Content</span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedBatch.ashPercent !== null ? `${selectedBatch.ashPercent}%` : 'Not measured'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400">Fixed Carbon</span>
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedBatch.carbonContentPercent !== null ? `${selectedBatch.carbonContentPercent}%` : 'Not measured'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400">Contamination</span>
                  <p className="font-semibold text-slate-800">{selectedBatch.contaminationStatus}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400">Storage</span>
                  <p className="font-semibold text-slate-800">{selectedBatch.storageCondition}</p>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">Preferred Utilization Route</span>
                <p className="font-semibold text-emerald-950 mt-0.5">{selectedBatch.preferredRoute}</p>
              </div>

              {selectedBatch.notes && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Field / Inspector Notes</span>
                  <p className="text-slate-600 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedBatch.notes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                <span>Contact: {selectedBatch.contactPerson}</span>
                <span>{selectedBatch.contactPhone}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedBatch(null);
                  navigate('/matching', { state: { selectedBatchId: selectedBatch.id } });
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition"
              >
                Match with Buyers →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BATCH MODAL */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingBatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Edit Batch: {editingBatch.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update quantity, moisture, ash content, or storage conditions
            </p>

            <form onSubmit={handleEditSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantity (Tonnes)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={editingBatch.quantityTonnes}
                  onChange={(e) =>
                    setEditingBatch({
                      ...editingBatch,
                      quantityTonnes: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 11.2"
                    value={editingBatch.moisturePercent !== null ? editingBatch.moisturePercent : ''}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        moisturePercent: e.target.value === '' ? null : parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank if unmeasured</span>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ash (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.0"
                    value={editingBatch.ashPercent !== null ? editingBatch.ashPercent : ''}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        ashPercent: e.target.value === '' ? null : parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Carbon (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 38.5"
                    value={editingBatch.carbonContentPercent !== null ? editingBatch.carbonContentPercent : ''}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        carbonContentPercent: e.target.value === '' ? null : parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contamination</label>
                  <select
                    value={editingBatch.contaminationStatus}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        contaminationStatus: e.target.value as ContaminationLevel,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Low / Clean">Low / Clean</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High / Contaminated">High / Contaminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Storage Condition</label>
                  <select
                    value={editingBatch.storageCondition}
                    onChange={(e) =>
                      setEditingBatch({
                        ...editingBatch,
                        storageCondition: e.target.value as StorageCondition,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Covered dry warehouse">Covered dry warehouse</option>
                    <option value="Silo storage">Silo storage</option>
                    <option value="Tarpaulin covered">Tarpaulin covered</option>
                    <option value="Open field pile">Open field pile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Inspector Notes</label>
                <textarea
                  rows={2}
                  value={editingBatch.notes || ''}
                  onChange={(e) => setEditingBatch({ ...editingBatch, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {batchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 relative">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Batch {batchToDelete.id}?</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to delete this {batchToDelete.quantityTonnes}-tonne {batchToDelete.residueType} batch from {batchToDelete.district}? This action will update inventory and analytics immediately.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setBatchToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
