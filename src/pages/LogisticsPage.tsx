import React, { useState, useEffect } from 'react';
import {
  Truck,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Scale,
  Building2,
  Calendar,
  Navigation,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { logisticsService } from '../services/logisticsService';
import { residueService } from '../services/residueService';
import { buyerService } from '../services/buyerService';
import { LogisticsTrip, ResidueBatch, BuyerProfile } from '../types';

export const LogisticsPage: React.FC = () => {
  const [trips, setTrips] = useState<LogisticsTrip[]>([]);
  const [batches, setBatches] = useState<ResidueBatch[]>([]);
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);

  // Multi-batch Aggregation Planner State
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(['BATCH-RH-2026-001']);
  const [targetBuyerId, setTargetBuyerId] = useState<string>('BUYER-SIL-001');
  const [vehicleCapacityTonnes, setVehicleCapacityTonnes] = useState<number>(50);
  const [transporterName, setTransporterName] = useState<string>('Deccan Freight Carriers Ltd.');
  const [driverName, setDriverName] = useState<string>('Mohd. Khaleel');
  const [pickupDate, setPickupDate] = useState<string>(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const loadData = () => {
    setTrips(logisticsService.getAllTrips());
    setBatches(residueService.getAllBatches());
    setBuyers(buyerService.getAllBuyers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('bvm_storage_update', loadData);
    return () => window.removeEventListener('bvm_storage_update', loadData);
  }, []);

  const selectedBuyer = buyers.find((b) => b.id === targetBuyerId) || buyers[0];
  const selectedBatches = batches.filter((b) => selectedBatchIds.includes(b.id));

  // Compute aggregation plan
  const aggregationPlan = logisticsService.planAggregation(
    selectedBatches,
    selectedBuyer,
    vehicleCapacityTonnes
  );

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aggregationPlan.canAggregate) return;

    logisticsService.createTrip({
      batchIds: selectedBatchIds,
      buyerId: targetBuyerId,
      buyerName: selectedBuyer.companyName,
      transporterName,
      vehicleType: `${vehicleCapacityTonnes}-Tonne Multi-Axle Hauler`,
      vehicleRegistration: `TS 09 UB ${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleCapacityTonnes,
      totalLoadTonnes: aggregationPlan.totalLoadTonnes,
      originLocations: selectedBatches.map((b) => `${b.location} (${b.district})`),
      destinationLocation: selectedBuyer.location,
      totalDistanceKm: aggregationPlan.estimatedDistanceKm,
      pickupDate,
      status: 'Proposed',
      driverName,
      driverPhone: '+91 98480 00112',
    });

    loadData();
  };

  const handleStatusChange = (
    tripId: string,
    newStatus: 'Proposed' | 'Scheduled' | 'Picked Up' | 'Delivered'
  ) => {
    logisticsService.updateTripStatus(tripId, newStatus);
    loadData();
  };

  const toggleBatchSelection = (batchId: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Collection & Logistics</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Simulated Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Coordinated feedstock haulage, freight economics, and multi-batch aggregation planning
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            Simulated route distances (No live GPS integration)
          </span>
        </div>
      </div>

      {/* MULTI-BATCH AGGREGATION PLANNER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              Multi-Batch Load Aggregation Planner
            </h3>
            <p className="text-xs text-slate-500">
              Combine multiple compatible smallholder or mill batches into a single cost-effective multi-tonne truckload
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {selectedBatchIds.length} Batches Grouped
          </span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Destination Industrial Buyer:
              </label>
              <select
                value={targetBuyerId}
                onChange={(e) => setTargetBuyerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
              >
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.companyName} ({b.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assigned Transporter Fleet:
              </label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Vehicle Payload Capacity (Tonnes):
              </label>
              <select
                value={vehicleCapacityTonnes}
                onChange={(e) => setVehicleCapacityTonnes(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value={20}>20 Tonnes (6-Wheeler Medium Hauler)</option>
                <option value={35}>35 Tonnes (10-Wheeler Heavy Hauler)</option>
                <option value={50}>50 Tonnes (16-Wheeler Multi-Axle Covered)</option>
                <option value={80}>80 Tonnes (High-Capacity Articulated Bulker)</option>
                <option value={100}>100 Tonnes (Twin-Trailer Industrial Consignment)</option>
              </select>
            </div>
          </div>

          {/* Select Compatible Batches Checkbox Grid */}
          <div>
            <span className="font-semibold text-slate-700 block mb-2">
              Select Inventory Batches to Aggregate:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {batches
                .filter((b) => b.status === 'Available' || selectedBatchIds.includes(b.id))
                .map((batch) => {
                  const isChecked = selectedBatchIds.includes(batch.id);
                  return (
                    <label
                      key={batch.id}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBatchSelection(batch.id)}
                        className="mt-1 text-emerald-700 rounded focus:ring-emerald-600"
                      />
                      <div className="leading-tight">
                        <span className="font-bold text-slate-800">{batch.id}</span>
                        <div className="text-[11px] text-slate-600">
                          {batch.quantityTonnes} t of {batch.residueType}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {batch.district} ({batch.estimatedCollectionDistanceKm} km)
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Aggregation Feasibility Outcome Bar */}
          {aggregationPlan.canAggregate ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Aggregation Plan Feasible & Legal
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  Vehicle Utilization: {aggregationPlan.utilizationPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-emerald-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, aggregationPlan.utilizationPercent)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Total Consignment</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {aggregationPlan.totalLoadTonnes} Tonnes
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Multi-Stop Distance</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {aggregationPlan.estimatedDistanceKm} km
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Total Transport Cost</span>
                  <p className="font-bold text-slate-900 text-sm">
                    ₹{aggregationPlan.estimatedCostInr.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Transport Cost per kg</span>
                  <p className="font-bold text-emerald-800 text-sm">
                    ₹{aggregationPlan.costPerKgInr} / kg
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Load Cannot Be Combined:</span>
                <p className="mt-0.5">{aggregationPlan.reason}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!aggregationPlan.canAggregate}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition ${
                aggregationPlan.canAggregate
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Create Scheduled Logistics Trip
            </button>
          </div>
        </form>
      </div>

      {/* ACTIVE LOGISTICS TRIPS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Active Simulated Logistics Trips</h3>
            <p className="text-xs text-slate-500">
              Advance haulage stage from Proposed → Scheduled → Picked Up → Delivered
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {trips.length} Trips Dispatched
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Trip ID / Vehicle</th>
                <th className="py-3 px-4">Origin & Destination</th>
                <th className="py-3 px-4 text-right">Load & Capacity</th>
                <th className="py-3 px-4 text-right">Freight Economics</th>
                <th className="py-3 px-4">Driver Contact</th>
                <th className="py-3 px-4">Pickup Date</th>
                <th className="py-3 px-4">Status Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">{trip.id}</span>
                    <div className="text-[11px] text-slate-500">{trip.transporterName}</div>
                    <span className="text-[10px] text-emerald-800 font-mono">
                      {trip.vehicleRegistration}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">
                      From: {trip.originLocations.join(', ')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      To: {trip.destinationLocation} ({trip.totalDistanceKm} km)
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-slate-900">{trip.totalLoadTonnes} t</span>
                    <div className="text-[10px] text-slate-400">
                      Cap: {trip.vehicleCapacityTonnes} t
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-slate-900">
                      ₹{trip.transportCostInr.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      ₹{trip.transportCostPerKgInr} / kg
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{trip.driverName}</div>
                    <div className="text-[10px] text-slate-400">{trip.driverPhone}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-700">{trip.pickupDate}</td>

                  <td className="py-3 px-4">
                    <select
                      value={trip.status}
                      onChange={(e) =>
                        handleStatusChange(
                          trip.id,
                          e.target.value as 'Proposed' | 'Scheduled' | 'Picked Up' | 'Delivered'
                        )
                      }
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none ${
                        trip.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : trip.status === 'Picked Up'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : trip.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="Proposed">Proposed</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Picked Up">Picked Up</option>
                      <option value="Delivered">Delivered</option>
                    </select>
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
