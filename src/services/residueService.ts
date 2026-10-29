import { ResidueBatch, BatchStatus, ResidueType, ContaminationLevel } from '../types';
import { storageService } from './storageService';

export interface BatchFilterOptions {
  searchQuery?: string;
  residueType?: string;
  district?: string;
  status?: string;
  contamination?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export const residueService = {
  getAllBatches(): ResidueBatch[] {
    return storageService.getBatches();
  },

  getBatchById(id: string): ResidueBatch | undefined {
    return this.getAllBatches().find((b) => b.id === id);
  },

  createBatch(batchData: Omit<ResidueBatch, 'id' | 'createdAt' | 'quantityKg'>): ResidueBatch {
    const batches = this.getAllBatches();
    const typeCode = batchData.residueType
      .split(' ')
      .map((w) => w[0].toUpperCase())
      .join('');
    const randomSeq = String(batches.length + 1).padStart(3, '0');
    const newId = `BATCH-${typeCode}-2026-${randomSeq}`;

    // Auto-calculate data confidence
    const hasLabData =
      batchData.moisturePercent !== null &&
      batchData.ashPercent !== null &&
      batchData.carbonContentPercent !== null;
    const confidence = hasLabData ? 'High' : 'Provisional (Missing Labs)';

    const newBatch: ResidueBatch = {
      ...batchData,
      id: newId,
      quantityKg: batchData.quantityTonnes * 1000,
      dataConfidence: confidence,
      createdAt: new Date().toISOString(),
    };

    const updated = [newBatch, ...batches];
    storageService.setBatches(updated);
    return newBatch;
  },

  updateBatch(updatedBatch: ResidueBatch): ResidueBatch {
    const batches = this.getAllBatches();
    const index = batches.findIndex((b) => b.id === updatedBatch.id);
    if (index === -1) {
      throw new Error(`Batch with ID ${updatedBatch.id} not found.`);
    }

    const hasLabData =
      updatedBatch.moisturePercent !== null &&
      updatedBatch.ashPercent !== null &&
      updatedBatch.carbonContentPercent !== null;
    const confidence = hasLabData ? 'High' : 'Provisional (Missing Labs)';

    const refreshed: ResidueBatch = {
      ...updatedBatch,
      quantityKg: updatedBatch.quantityTonnes * 1000,
      dataConfidence: confidence,
    };

    batches[index] = refreshed;
    storageService.setBatches(batches);
    return refreshed;
  },

  updateBatchStatus(id: string, newStatus: BatchStatus): ResidueBatch {
    const batch = this.getBatchById(id);
    if (!batch) throw new Error(`Batch ${id} not found`);
    return this.updateBatch({ ...batch, status: newStatus });
  },

  deleteBatch(id: string): boolean {
    const batches = this.getAllBatches();
    const filtered = batches.filter((b) => b.id !== id);
    if (filtered.length === batches.length) return false;
    storageService.setBatches(filtered);
    return true;
  },

  filterBatches(batches: ResidueBatch[], options: BatchFilterOptions): ResidueBatch[] {
    return batches.filter((batch) => {
      if (options.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        const matchesQuery =
          batch.id.toLowerCase().includes(q) ||
          batch.supplierName.toLowerCase().includes(q) ||
          batch.location.toLowerCase().includes(q) ||
          batch.district.toLowerCase().includes(q) ||
          batch.residueType.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (options.residueType && options.residueType !== 'All') {
        if (batch.residueType !== options.residueType) return false;
      }

      if (options.district && options.district !== 'All') {
        if (batch.district !== options.district) return false;
      }

      if (options.status && options.status !== 'All') {
        if (batch.status !== options.status) return false;
      }

      if (options.contamination && options.contamination !== 'All') {
        if (batch.contaminationStatus !== options.contamination) return false;
      }

      if (options.minQuantity !== undefined && batch.quantityTonnes < options.minQuantity) {
        return false;
      }

      if (options.maxQuantity !== undefined && batch.quantityTonnes > options.maxQuantity) {
        return false;
      }

      return true;
    });
  },
};
