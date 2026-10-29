import { TransactionRecord, TransactionStatus, MatchResult, ResidueBatch } from '../types';
import { storageService } from './storageService';
import { residueService } from './residueService';

export const VALID_STATUS_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  Listed: ['Matched', 'Buyer Request', 'Rejected'],
  Matched: ['Buyer Request', 'Rejected'],
  'Buyer Request': ['Accepted', 'Rejected'],
  Accepted: ['Pickup Scheduled', 'Rejected'],
  'Pickup Scheduled': ['In Transit', 'Rejected'],
  'In Transit': ['Delivered'],
  Delivered: ['End Use Recorded'],
  'End Use Recorded': [],
  Rejected: [],
};

export const transactionService = {
  getAllTransactions(): TransactionRecord[] {
    return storageService.getTransactions();
  },

  getTransactionById(id: string): TransactionRecord | undefined {
    return this.getAllTransactions().find((t) => t.id === id);
  },

  createTransactionFromMatch(
    batch: ResidueBatch,
    match: MatchResult,
    proposedPickupDate: string,
    offeredPricePerTonne?: number
  ): TransactionRecord {
    const transactions = this.getAllTransactions();
    const seq = String(transactions.length + 1).padStart(3, '0');
    const newId = `TXN-2026-${seq}`;

    const agreedPrice =
      offeredPricePerTonne ||
      Math.round((match.buyer.indicativePricePerTonneMin + match.buyer.indicativePricePerTonneMax) / 2);
    const totalAgreed = Math.round(batch.quantityTonnes * agreedPrice);
    const transportCost = match.estimatedTransportCost || Math.round(batch.quantityTonnes * match.distanceKm * 3.2 + 3500);
    const netValue = totalAgreed - transportCost;

    const now = new Date().toISOString();
    const newTxn: TransactionRecord = {
      id: newId,
      batchId: batch.id,
      buyerId: match.buyer.id,
      buyerName: match.buyer.companyName,
      supplierName: batch.supplierName,
      residueType: batch.residueType,
      quantityTonnes: batch.quantityTonnes,
      agreedPricePerTonne: agreedPrice,
      totalAgreedValue: totalAgreed,
      estimatedTransportCost: transportCost,
      netSimulatedValue: netValue,
      processingRoute: batch.preferredRoute,
      transporterName: 'Regional Logistics Fleet (Simulated)',
      vehicleCapacityTonnes: Math.ceil(batch.quantityTonnes * 1.1),
      proposedPickupDate: proposedPickupDate,
      status: 'Buyer Request',
      statusHistory: [
        {
          status: 'Listed',
          timestamp: batch.createdAt,
          note: `Batch ${batch.id} listed by ${batch.supplierName}`,
          actor: 'Supplier Desk',
        },
        {
          status: 'Matched',
          timestamp: now,
          note: `Smart match evaluated with score ${match.compatibilityScore}/100`,
          actor: 'Matching Engine',
        },
        {
          status: 'Buyer Request',
          timestamp: now,
          note: `Buyer request submitted at ₹${agreedPrice.toLocaleString('en-IN')}/t for ${batch.quantityTonnes} tonnes`,
          actor: `${match.buyer.contactPerson} (${match.buyer.companyName})`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Update batch status to 'Under Review' or 'Matched'
    residueService.updateBatchStatus(batch.id, 'Under Review');

    const updated = [newTxn, ...transactions];
    storageService.setTransactions(updated);
    return newTxn;
  },

  advanceStatus(
    id: string,
    newStatus: TransactionStatus,
    note: string,
    actor: string = 'Operations Desk'
  ): TransactionRecord {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaction ${id} not found`);

    const txn = transactions[index];
    const now = new Date().toISOString();

    const historyEntry = {
      status: newStatus,
      timestamp: now,
      note,
      actor,
    };

    const updatedTxn: TransactionRecord = {
      ...txn,
      status: newStatus,
      statusHistory: [...txn.statusHistory, historyEntry],
      updatedAt: now,
    };

    if (newStatus === 'Delivered') {
      updatedTxn.deliveryDate = now.split('T')[0];
      // update batch status in inventory
      residueService.updateBatchStatus(txn.batchId, 'Delivered');
    } else if (newStatus === 'Pickup Scheduled') {
      residueService.updateBatchStatus(txn.batchId, 'Pickup Scheduled');
    } else if (newStatus === 'In Transit') {
      residueService.updateBatchStatus(txn.batchId, 'In Transit');
    }

    transactions[index] = updatedTxn;
    storageService.setTransactions(transactions);
    return updatedTxn;
  },

  rejectTransaction(id: string, reason: string, actor: string = 'Auditor'): TransactionRecord {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaction ${id} not found`);

    const txn = transactions[index];
    const now = new Date().toISOString();

    const historyEntry = {
      status: 'Rejected' as TransactionStatus,
      timestamp: now,
      note: `Rejection notice: ${reason}`,
      actor,
    };

    const updatedTxn: TransactionRecord = {
      ...txn,
      status: 'Rejected',
      rejectionReason: reason,
      statusHistory: [...txn.statusHistory, historyEntry],
      updatedAt: now,
    };

    // Revert batch to Available
    residueService.updateBatchStatus(txn.batchId, 'Available');

    transactions[index] = updatedTxn;
    storageService.setTransactions(transactions);
    return updatedTxn;
  },

  recordEndUse(
    id: string,
    data: {
      endUseCategory: string;
      endUseFacility: string;
      simulatedVerificationEvidence: string;
      verificationNotes: string;
    }
  ): TransactionRecord {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaction ${id} not found`);

    const txn = transactions[index];
    const now = new Date().toISOString();

    const historyEntry = {
      status: 'End Use Recorded' as TransactionStatus,
      timestamp: now,
      note: `End-use verified at ${data.endUseFacility}: ${data.endUseCategory}. Evidence: ${data.simulatedVerificationEvidence}`,
      actor: 'End-Use Registry Auditor',
    };

    const updatedTxn: TransactionRecord = {
      ...txn,
      status: 'End Use Recorded',
      endUseCategory: data.endUseCategory,
      endUseFacility: data.endUseFacility,
      simulatedVerificationEvidence: data.simulatedVerificationEvidence,
      verificationNotes: data.verificationNotes,
      statusHistory: [...txn.statusHistory, historyEntry],
      updatedAt: now,
    };

    transactions[index] = updatedTxn;
    storageService.setTransactions(transactions);
    return updatedTxn;
  },
};
