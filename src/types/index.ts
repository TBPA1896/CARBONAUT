export type ResidueType =
  | 'Rice husk'
  | 'Rice straw'
  | 'Coconut husk'
  | 'Coconut shell'
  | 'Groundnut shell'
  | 'Maize cob'
  | 'Sugarcane bagasse'
  | 'Wheat straw'
  | 'Coffee husk';

export type SupplierType = 'farmer' | 'rice mill' | 'agro-processor' | 'aggregator';

export type ContaminationLevel = 'Low / Clean' | 'Moderate' | 'High / Contaminated';

export type StorageCondition =
  | 'Covered dry warehouse'
  | 'Open field pile'
  | 'Tarpaulin covered'
  | 'Silo storage';

export type BatchStatus =
  | 'Available'
  | 'Under Review'
  | 'Matched'
  | 'Pickup Scheduled'
  | 'In Transit'
  | 'Delivered'
  | 'Archived';

export type DataConfidence = 'High' | 'Medium' | 'Provisional (Missing Labs)';

export type UtilizationPathway =
  | 'Direct biomass energy / boiler fuel'
  | 'Biochar production'
  | 'Activated carbon production'
  | 'Silica-rich ash recovery'
  | 'Coir fibre & composites'
  | 'Fibre-based paper & packaging'
  | 'Carbonaceous adsorbent production';

export interface ResidueBatch {
  id: string;
  residueType: ResidueType;
  supplierName: string;
  supplierType: SupplierType;
  location: string;
  district: string;
  state: string;
  quantityKg: number;
  quantityTonnes: number;
  moisturePercent: number | null; // null represents 'Not measured'
  ashPercent: number | null;
  carbonContentPercent: number | null;
  contaminationStatus: ContaminationLevel;
  availableDate: string;
  storageCondition: StorageCondition;
  estimatedCollectionDistanceKm: number;
  preferredRoute: UtilizationPathway;
  status: BatchStatus;
  dataConfidence: DataConfidence;
  notes?: string;
  createdAt: string;
  contactPerson: string;
  contactPhone: string;
}

export type BuyerStatus = 'Active' | 'Capacity Constrained' | 'Paused';

export interface BuyerProfile {
  id: string;
  companyName: string;
  industryCategory: string;
  preferredResidues: ResidueType[];
  acceptedPathways: UtilizationPathway[];
  minBatchQuantityTonnes: number;
  maxBatchQuantityTonnes: number;
  maxMoisturePercent: number;
  maxAshPercent?: number;
  minCarbonPercent?: number;
  requiredQualityDocs: string[];
  location: string;
  district: string;
  distanceFromHubKm: number;
  indicativePricePerTonneMin: number; // in INR
  indicativePricePerTonneMax: number; // in INR
  status: BuyerStatus;
  contactPerson: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  processingCapabilities: string;
  environmentalComplianceStatus: string;
  maxAcceptableDistanceKm: number;
}

export interface MatchingWeights {
  materialPathwayWeight: number; // default 35
  quantityWeight: number; // default 20
  qualityWeight: number; // default 20
  distanceWeight: number; // default 15
  economicWeight: number; // default 10
}

export interface MatchScoreBreakdown {
  materialPathwayScore: number;
  quantityScore: number;
  qualityScore: number;
  distanceScore: number;
  economicScore: number;
}

export interface MatchResult {
  buyer: BuyerProfile;
  batch: ResidueBatch;
  isEligible: boolean;
  rejectionReasons: string[];
  provisionalQualityFlag: boolean;
  compatibilityScore: number; // 0 - 100
  breakdown: MatchScoreBreakdown;
  potentialGrossValue: number | null;
  estimatedTransportCost: number | null;
  estimatedProcessingCost: number | null;
  potentialNetValue: number | null;
  matchHighlights: string[];
  warnings: string[];
  distanceKm: number;
}

export type TransactionStatus =
  | 'Listed'
  | 'Matched'
  | 'Buyer Request'
  | 'Accepted'
  | 'Pickup Scheduled'
  | 'In Transit'
  | 'Delivered'
  | 'End Use Recorded'
  | 'Rejected';

export interface StatusHistoryEntry {
  status: TransactionStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface TransactionRecord {
  id: string;
  batchId: string;
  buyerId: string;
  buyerName: string;
  supplierName: string;
  residueType: ResidueType;
  quantityTonnes: number;
  agreedPricePerTonne: number;
  totalAgreedValue: number;
  estimatedTransportCost: number;
  netSimulatedValue: number;
  processingRoute: UtilizationPathway;
  transporterName: string;
  vehicleCapacityTonnes: number;
  proposedPickupDate: string;
  actualPickupDate?: string;
  deliveryDate?: string;
  status: TransactionStatus;
  rejectionReason?: string;
  endUseCategory?: string;
  endUseFacility?: string;
  simulatedVerificationEvidence?: string;
  verificationNotes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PathwayDetail {
  id: string;
  residueType: ResidueType;
  pathwayName: UtilizationPathway;
  recoveredProduct: string;
  targetIndustries: string[];
  requiredProcessing: string;
  keyQualityChecks: string[];
  technologicalReadiness: 'Established Commercial' | 'Emerging / Pilot Scale' | 'Research & Testing Required';
  indicativeProcessingCostPerTonne: number; // INR
  isCarbonRecovery: boolean;
  isMineralRecovery: boolean;
  description: string;
  technicalPrerequisites: string[];
  representativeBuyerCategories: string[];
}

export interface LogisticsTrip {
  id: string;
  batchIds: string[];
  buyerId: string;
  buyerName: string;
  transporterName: string;
  vehicleType: string;
  vehicleRegistration: string;
  vehicleCapacityTonnes: number;
  totalLoadTonnes: number;
  originLocations: string[];
  destinationLocation: string;
  totalDistanceKm: number;
  transportCostInr: number;
  transportCostPerKgInr: number;
  pickupDate: string;
  deliveryDate?: string;
  status: 'Proposed' | 'Scheduled' | 'Picked Up' | 'Delivered';
  driverName: string;
  driverPhone: string;
}
