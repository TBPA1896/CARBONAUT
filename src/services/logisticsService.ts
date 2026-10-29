import { LogisticsTrip, ResidueBatch, BuyerProfile } from '../types';
import { storageService } from './storageService';
import { residueService } from './residueService';

export const logisticsService = {
  getAllTrips(): LogisticsTrip[] {
    return storageService.getLogistics();
  },

  getTripById(id: string): LogisticsTrip | undefined {
    return this.getAllTrips().find((t) => t.id === id);
  },

  createTrip(tripData: Omit<LogisticsTrip, 'id' | 'transportCostInr' | 'transportCostPerKgInr'>): LogisticsTrip {
    const trips = this.getAllTrips();
    const seq = String(trips.length + 1).padStart(3, '0');
    const id = `TRIP-LOG-${seq}`;

    // Calculate transport cost: ₹3.2 per tonne-km + base loading ₹3,500
    const totalCost = Math.round(tripData.totalLoadTonnes * tripData.totalDistanceKm * 3.2 + 3500);
    const costPerKg = Number((totalCost / (tripData.totalLoadTonnes * 1000 || 1)).toFixed(3));

    const newTrip: LogisticsTrip = {
      ...tripData,
      id,
      transportCostInr: totalCost,
      transportCostPerKgInr: costPerKg,
    };

    const updated = [newTrip, ...trips];
    storageService.setLogistics(updated);

    // Update batch statuses
    tripData.batchIds.forEach((batchId) => {
      residueService.updateBatchStatus(batchId, 'Pickup Scheduled');
    });

    return newTrip;
  },

  updateTripStatus(
    id: string,
    newStatus: 'Proposed' | 'Scheduled' | 'Picked Up' | 'Delivered',
    deliveryDate?: string
  ): LogisticsTrip {
    const trips = this.getAllTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Trip ${id} not found`);

    const trip = trips[index];
    const updated: LogisticsTrip = {
      ...trip,
      status: newStatus,
      deliveryDate: newStatus === 'Delivered' ? (deliveryDate || new Date().toISOString().split('T')[0]) : trip.deliveryDate,
    };

    trips[index] = updated;
    storageService.setLogistics(trips);

    // Synchronize batch status
    if (newStatus === 'Delivered') {
      trip.batchIds.forEach((bId) => residueService.updateBatchStatus(bId, 'Delivered'));
    } else if (newStatus === 'Picked Up') {
      trip.batchIds.forEach((bId) => residueService.updateBatchStatus(bId, 'In Transit'));
    } else if (newStatus === 'Scheduled') {
      trip.batchIds.forEach((bId) => residueService.updateBatchStatus(bId, 'Pickup Scheduled'));
    }

    return updated;
  },

  planAggregation(
    batches: ResidueBatch[],
    buyer: BuyerProfile,
    targetVehicleCapacityTonnes: number
  ): {
    canAggregate: boolean;
    reason?: string;
    totalLoadTonnes: number;
    utilizationPercent: number;
    compatibleBatches: ResidueBatch[];
    estimatedDistanceKm: number;
    estimatedCostInr: number;
    costPerKgInr: number;
  } {
    if (batches.length === 0) {
      return {
        canAggregate: false,
        reason: 'No batches selected for aggregation',
        totalLoadTonnes: 0,
        utilizationPercent: 0,
        compatibleBatches: [],
        estimatedDistanceKm: 0,
        estimatedCostInr: 0,
        costPerKgInr: 0,
      };
    }

    // Material compatibility rule: Batches must be of the exact same residue type or compatible biomass family
    const firstType = batches[0].residueType;
    const isUniform = batches.every((b) => b.residueType === firstType);
    if (!isUniform) {
      return {
        canAggregate: false,
        reason: 'Material incompatibility: Batches must share the same residue type to avoid cross-contamination in transit.',
        totalLoadTonnes: 0,
        utilizationPercent: 0,
        compatibleBatches: [],
        estimatedDistanceKm: 0,
        estimatedCostInr: 0,
        costPerKgInr: 0,
      };
    }

    const totalLoadTonnes = batches.reduce((sum, b) => sum + b.quantityTonnes, 0);
    if (totalLoadTonnes > targetVehicleCapacityTonnes * 1.05) {
      return {
        canAggregate: false,
        reason: `Combined weight (${totalLoadTonnes} t) exceeds vehicle legal weight limit (${targetVehicleCapacityTonnes} t).`,
        totalLoadTonnes,
        utilizationPercent: Math.round((totalLoadTonnes / targetVehicleCapacityTonnes) * 100),
        compatibleBatches: batches,
        estimatedDistanceKm: 0,
        estimatedCostInr: 0,
        costPerKgInr: 0,
      };
    }

    // Aggregated multi-stop distance: max single distance + 25km per additional pickup stop
    const maxBaseDist = Math.max(...batches.map((b) => b.estimatedCollectionDistanceKm));
    const multiStopDistance = Math.round(maxBaseDist + (batches.length - 1) * 28 + buyer.distanceFromHubKm * 0.4);

    const estimatedCostInr = Math.round(totalLoadTonnes * multiStopDistance * 3.1 + 4200);
    const costPerKgInr = Number((estimatedCostInr / (totalLoadTonnes * 1000)).toFixed(3));
    const utilizationPercent = Math.min(100, Math.round((totalLoadTonnes / targetVehicleCapacityTonnes) * 100));

    return {
      canAggregate: true,
      totalLoadTonnes,
      utilizationPercent,
      compatibleBatches: batches,
      estimatedDistanceKm: multiStopDistance,
      estimatedCostInr,
      costPerKgInr,
    };
  },
};
