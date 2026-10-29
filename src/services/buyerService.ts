import { BuyerProfile, ResidueType, UtilizationPathway, BuyerStatus } from '../types';
import { storageService } from './storageService';

export interface BuyerFilterOptions {
  searchQuery?: string;
  industryCategory?: string;
  acceptedResidue?: string;
  status?: string;
  maxDistance?: number;
}

export const buyerService = {
  getAllBuyers(): BuyerProfile[] {
    return storageService.getBuyers();
  },

  getBuyerById(id: string): BuyerProfile | undefined {
    return this.getAllBuyers().find((b) => b.id === id);
  },

  createBuyer(buyerData: Omit<BuyerProfile, 'id'>): BuyerProfile {
    const buyers = this.getAllBuyers();
    const indCode = buyerData.industryCategory.substring(0, 3).toUpperCase();
    const seq = String(buyers.length + 1).padStart(3, '0');
    const newId = `BUYER-${indCode}-${seq}`;

    const newBuyer: BuyerProfile = {
      ...buyerData,
      id: newId,
    };

    const updated = [newBuyer, ...buyers];
    storageService.setBuyers(updated);
    return newBuyer;
  },

  updateBuyer(updatedBuyer: BuyerProfile): BuyerProfile {
    const buyers = this.getAllBuyers();
    const index = buyers.findIndex((b) => b.id === updatedBuyer.id);
    if (index === -1) {
      throw new Error(`Buyer with ID ${updatedBuyer.id} not found.`);
    }

    buyers[index] = updatedBuyer;
    storageService.setBuyers(buyers);
    return updatedBuyer;
  },

  deleteBuyer(id: string): boolean {
    const buyers = this.getAllBuyers();
    const filtered = buyers.filter((b) => b.id !== id);
    if (filtered.length === buyers.length) return false;
    storageService.setBuyers(filtered);
    return true;
  },

  filterBuyers(buyers: BuyerProfile[], options: BuyerFilterOptions): BuyerProfile[] {
    return buyers.filter((buyer) => {
      if (options.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        const matchesQuery =
          buyer.companyName.toLowerCase().includes(q) ||
          buyer.industryCategory.toLowerCase().includes(q) ||
          buyer.location.toLowerCase().includes(q) ||
          buyer.preferredResidues.some((r) => r.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      if (options.industryCategory && options.industryCategory !== 'All') {
        if (buyer.industryCategory !== options.industryCategory) return false;
      }

      if (options.acceptedResidue && options.acceptedResidue !== 'All') {
        if (!buyer.preferredResidues.includes(options.acceptedResidue as ResidueType)) {
          return false;
        }
      }

      if (options.status && options.status !== 'All') {
        if (buyer.status !== options.status) return false;
      }

      if (options.maxDistance && buyer.distanceFromHubKm > options.maxDistance) {
        return false;
      }

      return true;
    });
  },
};
