import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { buyerService, BuyerFilterOptions } from '../services/buyerService';
import { residueService } from '../services/residueService';
import { BuyerProfile, ResidueType, UtilizationPathway, BuyerStatus, ResidueBatch } from '../types';

export const BuyerNetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [allBatches, setAllBatches] = useState<ResidueBatch[]>([]);

  // Modals state
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<BuyerProfile | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [residueFilter, setResidueFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = () => {
    setBuyers(buyerService.getAllBuyers());
    setAllBatches(residueService.getAllBatches());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bvm_storage_update', loadData);
    return () => window.removeEventListener('bvm_storage_update', loadData);
  }, []);

  const filteredBuyers = buyerService.filterBuyers(buyers, {
    searchQuery,
    industryCategory: industryFilter,
    acceptedResidue: residueFilter,
    status: statusFilter,
  });

  const uniqueIndustries = Array.from(new Set(buyers.map((b) => b.industryCategory))).sort();
  const uniqueResidues = Array.from(
    new Set(buyers.flatMap((b) => b.preferredResidues))
  ).sort();

  // Find matching batches for a specific buyer
  const getMatchingBatchesForBuyer = (buyer: BuyerProfile) => {
    return allBatches.filter(
      (batch) =>
        buyer.preferredResidues.includes(batch.residueType) &&
        batch.quantityTonnes >= buyer.minBatchQuantityTonnes &&
        batch.quantityTonnes <= buyer.maxBatchQuantityTonnes &&
        (batch.moisturePercent === null || batch.moisturePercent <= buyer.maxMoisturePercent)
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuyer) {
      buyerService.updateBuyer(editingBuyer);
      setEditingBuyer(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                Industry Buyer Network
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredBuyers.length} Industrial Offtakers
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verified synthetic buyer profiles across Telangana with explicit acceptance thresholds and price bands
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 italic hidden md:inline">
              Fictional profiles for academic demonstration
            </span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Industry Sectors</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Residue Filter */}
          <div>
            <select
              value={residueFilter}
              onChange={(e) => setResidueFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Accepted Residues</option>
              {uniqueResidues.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-700"
            >
              <option value="All">All Operational Statuses</option>
              <option value="Active">Active</option>
              <option value="Capacity Constrained">Capacity Constrained</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.map((buyer) => {
          const matchingBatches = getMatchingBatchesForBuyer(buyer);
          return (
            <div
              key={buyer.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                    {buyer.id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      buyer.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : buyer.status === 'Capacity Constrained'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {buyer.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {buyer.companyName}
                </h3>
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  {buyer.industryCategory}
                </span>

                <p className="text-[11px] text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                  {buyer.processingCapabilities}
                </p>

                {/* Technical Acceptance Specifications */}
                <div className="space-y-1.5 text-xs py-2.5 border-t border-slate-100 text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Accepted Feedstocks:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {buyer.preferredResidues.join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Intake Batch Window:</span>
                    <strong className="text-slate-800">
                      {buyer.minBatchQuantityTonnes} - {buyer.maxBatchQuantityTonnes} t
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Moisture Limit:</span>
                    <strong className="text-slate-800">&le; {buyer.maxMoisturePercent}%</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Indicative Purchase Band:</span>
                    <strong className="text-emerald-800 font-semibold">
                      ₹{buyer.indicativePricePerTonneMin.toLocaleString('en-IN')} - ₹{buyer.indicativePricePerTonneMax.toLocaleString('en-IN')} / t
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Max Haulage Radius:</span>
                    <span className="text-slate-700">{buyer.maxAcceptableDistanceKm} km</span>
                  </div>
                </div>

                {/* Matching Batches Pill */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Currently Matching:</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {matchingBatches.length} Inventory Batches
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setEditingBuyer({ ...buyer })}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                  title="Edit Specifications"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedBuyer(buyer)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-700 border border-emerald-200 rounded-lg transition"
                >
                  View Acceptance Specs
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW BUYER ACCEPTANCE SPECS MODAL */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBuyer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedBuyer.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {selectedBuyer.industryCategory}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {selectedBuyer.companyName}
            </h2>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {selectedBuyer.location} ({selectedBuyer.distanceFromHubKm} km from central hub)
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Processing Technology & Equipment:
                </span>
                <p className="text-slate-600 leading-relaxed">{selectedBuyer.processingCapabilities}</p>
                <div className="pt-2 border-t border-slate-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Compliance: {selectedBuyer.environmentalComplianceStatus}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Technical Acceptance Criteria
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400">Accepted Residues</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedBuyer.preferredResidues.join(', ')}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400">Accepted Pathways</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedBuyer.acceptedPathways.join(' / ')}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400">Batch Quantity Window</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedBuyer.minBatchQuantityTonnes} t to {selectedBuyer.maxBatchQuantityTonnes} t
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400">Moisture & Ash Ceilings</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      Moisture &le; {selectedBuyer.maxMoisturePercent}%{' '}
                      {selectedBuyer.maxAshPercent ? `| Ash &le; ${selectedBuyer.maxAshPercent}%` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-1">
                  Mandatory Delivery Documentation Required:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBuyer.requiredQualityDocs.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-medium"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">
                    Indicative Purchase Range
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    ₹{selectedBuyer.indicativePricePerTonneMin.toLocaleString('en-IN')} - ₹{selectedBuyer.indicativePricePerTonneMax.toLocaleString('en-IN')} / tonne
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Contact Official</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBuyer.contactPerson} ({selectedBuyer.contactRole})
                  </span>
                </div>
              </div>

              {/* Matching batches list */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Matching Feedstock Batches in Inventory ({getMatchingBatchesForBuyer(selectedBuyer).length})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {getMatchingBatchesForBuyer(selectedBuyer).map((b) => (
                    <div
                      key={b.id}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{b.id}</span>
                        <span className="text-slate-500 ml-2">
                          {b.quantityTonnes} t of {b.residueType} ({b.district})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBuyer(null);
                          navigate('/matching', { state: { selectedBatchId: b.id } });
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Run Match →
                      </button>
                    </div>
                  ))}
                  {getMatchingBatchesForBuyer(selectedBuyer).length === 0 && (
                    <p className="text-slate-400 italic">No batches currently match all requirements.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BUYER MODAL */}
      {editingBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingBuyer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Edit Specifications: {editingBuyer.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update pricing bands, moisture ceiling, and maximum intake quantity
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Price / Tonne (₹)</label>
                  <input
                    type="number"
                    value={editingBuyer.indicativePricePerTonneMin}
                    onChange={(e) =>
                      setEditingBuyer({
                        ...editingBuyer,
                        indicativePricePerTonneMin: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Price / Tonne (₹)</label>
                  <input
                    type="number"
                    value={editingBuyer.indicativePricePerTonneMax}
                    onChange={(e) =>
                      setEditingBuyer({
                        ...editingBuyer,
                        indicativePricePerTonneMax: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Moisture Tolerance (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingBuyer.maxMoisturePercent}
                    onChange={(e) =>
                      setEditingBuyer({
                        ...editingBuyer,
                        maxMoisturePercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operational Status</label>
                  <select
                    value={editingBuyer.status}
                    onChange={(e) =>
                      setEditingBuyer({
                        ...editingBuyer,
                        status: e.target.value as BuyerStatus,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none bg-slate-50/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Capacity Constrained">Capacity Constrained</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Max Logistics Radius (km)</label>
                <input
                  type="number"
                  value={editingBuyer.maxAcceptableDistanceKm}
                  onChange={(e) =>
                    setEditingBuyer({
                      ...editingBuyer,
                      maxAcceptableDistanceKm: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBuyer(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
                >
                  Save Specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
