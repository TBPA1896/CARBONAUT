import { storageService } from './storageService';
import { ResidueType, TransactionRecord, ResidueBatch, BuyerProfile } from '../types';

export interface AnalyticsSummary {
  totalResidueTonnes: number;
  availableResidueTonnes: number;
  totalBatchesCount: number;
  availableBatchesCount: number;
  totalBuyersCount: number;
  activeBuyersCount: number;
  matchedBatchesCount: number;
  awaitingCollectionCount: number;
  totalEstimatedValueInr: number;
  completedTransactionsCount: number;
  matchAcceptanceRatePercent: number;
  avgTransportCostPerKgInr: number;
  supplyByType: { name: string; tonnes: number; batches: number }[];
  supplyByDistrict: { district: string; tonnes: number }[];
  demandByIndustry: { industry: string; buyersCount: number; capacityTonnes: number }[];
  batchStatusDistribution: { status: string; count: number; tonnes: number }[];
  transactionPipeline: { stage: string; count: number; valueInr: number }[];
  endUseDistribution: { category: string; tonnes: number; count: number }[];
  eligibilityRatio: { name: string; value: number }[];
}

export const analyticsService = {
  getAnalyticsData(): AnalyticsSummary {
    const batches: ResidueBatch[] = storageService.getBatches();
    const buyers: BuyerProfile[] = storageService.getBuyers();
    const transactions: TransactionRecord[] = storageService.getTransactions();

    // Total and Available Residue
    const totalResidueTonnes = batches.reduce((sum, b) => sum + b.quantityTonnes, 0);
    const availableBatches = batches.filter((b) => b.status === 'Available');
    const availableResidueTonnes = availableBatches.reduce((sum, b) => sum + b.quantityTonnes, 0);

    const totalBatchesCount = batches.length;
    const availableBatchesCount = availableBatches.length;

    const totalBuyersCount = buyers.length;
    const activeBuyersCount = buyers.filter((b) => b.status === 'Active').length;

    // Matched batches (either in batch status or active in transactions)
    const matchedBatchesCount = batches.filter(
      (b) => b.status === 'Matched' || b.status === 'Under Review' || b.status === 'Pickup Scheduled' || b.status === 'In Transit' || b.status === 'Delivered'
    ).length;

    const awaitingCollectionCount = batches.filter(
      (b) => b.status === 'Pickup Scheduled' || b.status === 'Under Review' || b.status === 'Matched'
    ).length;

    // Estimated value of matched transactions
    const totalEstimatedValueInr = transactions
      .filter((t) => t.status !== 'Rejected')
      .reduce((sum, t) => sum + t.totalAgreedValue, 0);

    // Completed transactions
    const completedTransactions = transactions.filter(
      (t) => t.status === 'Delivered' || t.status === 'End Use Recorded'
    );
    const completedTransactionsCount = completedTransactions.length;

    // Acceptance rate: calculated from transactions where buyer made a request or offer
    // Denominator = total transaction decisions (Accepted + Pickup Scheduled + In Transit + Delivered + End Use Recorded + Rejected)
    const acceptedOrFurther = transactions.filter(
      (t) =>
        t.status === 'Accepted' ||
        t.status === 'Pickup Scheduled' ||
        t.status === 'In Transit' ||
        t.status === 'Delivered' ||
        t.status === 'End Use Recorded'
    ).length;
    const rejectedCount = transactions.filter((t) => t.status === 'Rejected').length;
    const totalDecisions = acceptedOrFurther + rejectedCount;
    const matchAcceptanceRatePercent =
      totalDecisions > 0 ? Math.round((acceptedOrFurther / totalDecisions) * 100) : 0;

    // Average transport cost per kg
    const txnsWithTransport = transactions.filter((t) => t.estimatedTransportCost > 0);
    const totalTransportCost = txnsWithTransport.reduce((sum, t) => sum + t.estimatedTransportCost, 0);
    const totalTransportKg = txnsWithTransport.reduce((sum, t) => sum + t.quantityTonnes * 1000, 0);
    const avgTransportCostPerKgInr =
      totalTransportKg > 0 ? Number((totalTransportCost / totalTransportKg).toFixed(3)) : 0.48;

    // Supply by Type
    const typeMap = new Map<string, { tonnes: number; batches: number }>();
    batches.forEach((b) => {
      const existing = typeMap.get(b.residueType) || { tonnes: 0, batches: 0 };
      typeMap.set(b.residueType, {
        tonnes: existing.tonnes + b.quantityTonnes,
        batches: existing.batches + 1,
      });
    });
    const supplyByType = Array.from(typeMap.entries()).map(([name, data]) => ({
      name,
      tonnes: data.tonnes,
      batches: data.batches,
    }));

    // Supply by District
    const distMap = new Map<string, number>();
    batches.forEach((b) => {
      const current = distMap.get(b.district) || 0;
      distMap.set(b.district, current + b.quantityTonnes);
    });
    const supplyByDistrict = Array.from(distMap.entries())
      .map(([district, tonnes]) => ({ district, tonnes }))
      .sort((a, b) => b.tonnes - a.tonnes);

    // Demand by Industry
    const indMap = new Map<string, { buyersCount: number; capacityTonnes: number }>();
    buyers.forEach((b) => {
      const existing = indMap.get(b.industryCategory) || { buyersCount: 0, capacityTonnes: 0 };
      indMap.set(b.industryCategory, {
        buyersCount: existing.buyersCount + 1,
        capacityTonnes: existing.capacityTonnes + b.maxBatchQuantityTonnes,
      });
    });
    const demandByIndustry = Array.from(indMap.entries()).map(([industry, data]) => ({
      industry,
      buyersCount: data.buyersCount,
      capacityTonnes: data.capacityTonnes,
    }));

    // Batch Status Breakdown
    const statusMap = new Map<string, { count: number; tonnes: number }>();
    batches.forEach((b) => {
      const existing = statusMap.get(b.status) || { count: 0, tonnes: 0 };
      statusMap.set(b.status, {
        count: existing.count + 1,
        tonnes: existing.tonnes + b.quantityTonnes,
      });
    });
    const batchStatusDistribution = Array.from(statusMap.entries()).map(([status, d]) => ({
      status,
      count: d.count,
      tonnes: d.tonnes,
    }));

    // Transaction Pipeline
    const pipelineStages = [
      'Buyer Request',
      'Accepted',
      'Pickup Scheduled',
      'In Transit',
      'Delivered',
      'End Use Recorded',
    ];
    const transactionPipeline = pipelineStages.map((stage) => {
      const matching = transactions.filter((t) => t.status === stage);
      return {
        stage,
        count: matching.length,
        valueInr: matching.reduce((sum, t) => sum + t.totalAgreedValue, 0),
      };
    });

    // End Use Distribution
    const endUseMap = new Map<string, { tonnes: number; count: number }>();
    transactions
      .filter((t) => t.status === 'End Use Recorded' || t.status === 'Delivered')
      .forEach((t) => {
        const cat = t.endUseCategory || 'Thermal Boiler Fuel';
        const existing = endUseMap.get(cat) || { tonnes: 0, count: 0 };
        endUseMap.set(cat, {
          tonnes: existing.tonnes + t.quantityTonnes,
          count: existing.count + 1,
        });
      });
    const endUseDistribution = Array.from(endUseMap.entries()).map(([category, d]) => ({
      category,
      tonnes: d.tonnes,
      count: d.count,
    }));

    // Simulated Eligibility Ratio (based on typical compatibility across batches)
    const eligibilityRatio = [
      { name: 'Eligible Matches', value: 74 },
      { name: 'Rejected Constraints', value: 26 },
    ];

    return {
      totalResidueTonnes,
      availableResidueTonnes,
      totalBatchesCount,
      availableBatchesCount,
      totalBuyersCount,
      activeBuyersCount,
      matchedBatchesCount,
      awaitingCollectionCount,
      totalEstimatedValueInr,
      completedTransactionsCount,
      matchAcceptanceRatePercent,
      avgTransportCostPerKgInr,
      supplyByType,
      supplyByDistrict,
      demandByIndustry,
      batchStatusDistribution,
      transactionPipeline,
      endUseDistribution,
      eligibilityRatio,
    };
  },
};
