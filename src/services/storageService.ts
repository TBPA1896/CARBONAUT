import {
  ResidueBatch,
  BuyerProfile,
  TransactionRecord,
  LogisticsTrip,
  MatchingWeights,
} from '../types';
import {
  SEED_RESIDUE_BATCHES,
  SEED_BUYER_PROFILES,
  SEED_TRANSACTIONS,
  SEED_LOGISTICS_TRIPS,
} from '../data/seedData';

const KEYS = {
  BATCHES: 'bvm_batches_v1',
  BUYERS: 'bvm_buyers_v1',
  TRANSACTIONS: 'bvm_transactions_v1',
  LOGISTICS: 'bvm_logistics_v1',
  WEIGHTS: 'bvm_matching_weights_v1',
};

export const DEFAULT_WEIGHTS: MatchingWeights = {
  materialPathwayWeight: 35,
  quantityWeight: 20,
  qualityWeight: 20,
  distanceWeight: 15,
  economicWeight: 10,
};

function dispatchStorageEvent() {
  window.dispatchEvent(new Event('bvm_storage_update'));
}

export const storageService = {
  initStorage() {
    if (!localStorage.getItem(KEYS.BATCHES)) {
      this.resetToSeedData();
    }
  },

  resetToSeedData() {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(SEED_RESIDUE_BATCHES));
    localStorage.setItem(KEYS.BUYERS, JSON.stringify(SEED_BUYER_PROFILES));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
    localStorage.setItem(KEYS.LOGISTICS, JSON.stringify(SEED_LOGISTICS_TRIPS));
    localStorage.setItem(KEYS.WEIGHTS, JSON.stringify(DEFAULT_WEIGHTS));
    dispatchStorageEvent();
  },

  loadDemoScenarioState() {
    // Reset to clean seed data and ensure standard sample records are ready
    this.resetToSeedData();
  },

  getBatches(): ResidueBatch[] {
    const raw = localStorage.getItem(KEYS.BATCHES);
    return raw ? JSON.parse(raw) : SEED_RESIDUE_BATCHES;
  },

  setBatches(batches: ResidueBatch[]) {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
    dispatchStorageEvent();
  },

  getBuyers(): BuyerProfile[] {
    const raw = localStorage.getItem(KEYS.BUYERS);
    return raw ? JSON.parse(raw) : SEED_BUYER_PROFILES;
  },

  setBuyers(buyers: BuyerProfile[]) {
    localStorage.setItem(KEYS.BUYERS, JSON.stringify(buyers));
    dispatchStorageEvent();
  },

  getTransactions(): TransactionRecord[] {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : SEED_TRANSACTIONS;
  },

  setTransactions(txns: TransactionRecord[]) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txns));
    dispatchStorageEvent();
  },

  getLogistics(): LogisticsTrip[] {
    const raw = localStorage.getItem(KEYS.LOGISTICS);
    return raw ? JSON.parse(raw) : SEED_LOGISTICS_TRIPS;
  },

  setLogistics(trips: LogisticsTrip[]) {
    localStorage.setItem(KEYS.LOGISTICS, JSON.stringify(trips));
    dispatchStorageEvent();
  },

  getMatchingWeights(): MatchingWeights {
    const raw = localStorage.getItem(KEYS.WEIGHTS);
    return raw ? JSON.parse(raw) : DEFAULT_WEIGHTS;
  },

  setMatchingWeights(weights: MatchingWeights) {
    localStorage.setItem(KEYS.WEIGHTS, JSON.stringify(weights));
    dispatchStorageEvent();
  },
};
