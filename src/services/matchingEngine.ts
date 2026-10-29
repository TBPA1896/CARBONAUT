import {
  ResidueBatch,
  BuyerProfile,
  MatchResult,
  MatchingWeights,
  UtilizationPathway,
} from '../types';
import { recoveryService } from './recoveryService';

export const matchingEngine = {
  calculateDistance(batch: ResidueBatch, buyer: BuyerProfile): number {
    // Realistic regional distance calculation in Telangana
    // If supplier is in Nizamabad (north) and buyer is in Sangareddy/Hyderabad (central),
    // we use a realistic network approximation based on reported hub distances.
    if (batch.district === buyer.district) {
      return Math.max(15, Math.round(Math.abs(batch.estimatedCollectionDistanceKm - buyer.distanceFromHubKm) * 0.5) + 12);
    }
    const dist = Math.round(
      Math.sqrt(
        Math.pow(batch.estimatedCollectionDistanceKm, 1.1) +
        Math.pow(buyer.distanceFromHubKm, 1.1)
      ) * 0.95 + 20
    );
    return Math.min(dist, 380);
  },

  evaluateBuyerMatch(
    batch: ResidueBatch,
    buyer: BuyerProfile,
    pathway: UtilizationPathway,
    weights: MatchingWeights
  ): MatchResult {
    const rejectionReasons: string[] = [];
    const warnings: string[] = [];
    const matchHighlights: string[] = [];
    let provisionalQualityFlag = false;

    // STEP 1: Material & Pathway Acceptance Check
    const acceptsResidue = buyer.preferredResidues.includes(batch.residueType);
    if (!acceptsResidue) {
      rejectionReasons.push(`Buyer does not accept ${batch.residueType} (accepts: ${buyer.preferredResidues.join(', ')})`);
    }

    const acceptsPathway = buyer.acceptedPathways.includes(pathway);
    if (!acceptsPathway) {
      rejectionReasons.push(`Buyer does not process via "${pathway}"`);
    }

    // Check buyer operational status
    if (buyer.status === 'Paused') {
      rejectionReasons.push('Buyer facility is temporarily paused/inactive');
    }

    // STEP 2: Quantity Window Check
    if (batch.quantityTonnes < buyer.minBatchQuantityTonnes) {
      rejectionReasons.push(
        `Quantity (${batch.quantityTonnes} t) is below buyer minimum threshold of ${buyer.minBatchQuantityTonnes} t`
      );
    }
    if (batch.quantityTonnes > buyer.maxBatchQuantityTonnes) {
      rejectionReasons.push(
        `Quantity (${batch.quantityTonnes} t) exceeds buyer maximum intake capacity of ${buyer.maxBatchQuantityTonnes} t`
      );
    }

    // STEP 3: Moisture Tolerance Check
    if (batch.moisturePercent !== null) {
      if (batch.moisturePercent > buyer.maxMoisturePercent) {
        rejectionReasons.push(
          `Moisture content (${batch.moisturePercent}%) exceeds buyer maximum tolerance of ${buyer.maxMoisturePercent}%`
        );
      } else {
        matchHighlights.push(`Moisture content (${batch.moisturePercent}%) is within tolerance (< ${buyer.maxMoisturePercent}%)`);
      }
    } else {
      provisionalQualityFlag = true;
      warnings.push('Provisional match — quality verification required (feedstock moisture not measured)');
    }

    // STEP 4: Mandatory Quality Constraints & Documentation
    if (batch.contaminationStatus === 'High / Contaminated') {
      rejectionReasons.push('Feedstock has High Contamination status (buyer requires low/moderate)');
    } else if (batch.contaminationStatus === 'Moderate') {
      warnings.push('Moderate contamination reported; dedusting/screening pre-treatment advised');
    }

    if (buyer.maxAshPercent && batch.ashPercent !== null) {
      if (batch.ashPercent > buyer.maxAshPercent) {
        rejectionReasons.push(`Ash content (${batch.ashPercent}%) exceeds buyer ceiling of ${buyer.maxAshPercent}%`);
      }
    }

    if (buyer.minCarbonPercent && batch.carbonContentPercent !== null) {
      if (batch.carbonContentPercent < buyer.minCarbonPercent) {
        rejectionReasons.push(`Fixed carbon (${batch.carbonContentPercent}%) below buyer minimum specification of ${buyer.minCarbonPercent}%`);
      }
    }

    if (buyer.requiredQualityDocs.length > 0) {
      warnings.push(`Required documentation on delivery: ${buyer.requiredQualityDocs.join(', ')}`);
    }

    // STEP 5: Distance Evaluation
    const distanceKm = this.calculateDistance(batch, buyer);
    if (distanceKm > buyer.maxAcceptableDistanceKm) {
      rejectionReasons.push(`Transport distance (${distanceKm} km) exceeds buyer logistics limit of ${buyer.maxAcceptableDistanceKm} km`);
    } else {
      matchHighlights.push(`Within viable logistics radius (${distanceKm} km vs max ${buyer.maxAcceptableDistanceKm} km)`);
    }

    const isEligible = rejectionReasons.length === 0;

    // STEP 6: Economic Estimation
    const avgIndicativePrice = (buyer.indicativePricePerTonneMin + buyer.indicativePricePerTonneMax) / 2;
    const potentialGrossValue = Math.round(batch.quantityTonnes * avgIndicativePrice);

    // Simulated transport cost: ~₹3.20 per tonne-km with a ₹3,500 base loading charge
    const estimatedTransportCost = Math.round(batch.quantityTonnes * distanceKm * 3.2 + 3500);

    // Retrieve pathway processing cost
    const pathwayDetail = recoveryService.getPathwayDetail(batch.residueType, pathway);
    const estimatedProcessingCost = pathwayDetail
      ? Math.round(batch.quantityTonnes * pathwayDetail.indicativeProcessingCostPerTonne)
      : null;

    const potentialNetValue =
      potentialGrossValue !== null && estimatedTransportCost !== null && estimatedProcessingCost !== null
        ? potentialGrossValue - estimatedTransportCost - estimatedProcessingCost
        : null;

    if (isEligible) {
      matchHighlights.push(`Indicative price band: ₹${buyer.indicativePricePerTonneMin.toLocaleString('en-IN')} - ₹${buyer.indicativePricePerTonneMax.toLocaleString('en-IN')} / tonne`);
      if (potentialNetValue && potentialNetValue > 0) {
        matchHighlights.push(`Estimated net simulated value after transport & processing: ₹${potentialNetValue.toLocaleString('en-IN')}`);
      }
    }

    // STEP 7: Scoring with Configurable Weights
    let breakdown = {
      materialPathwayScore: 0,
      quantityScore: 0,
      qualityScore: 0,
      distanceScore: 0,
      economicScore: 0,
    };
    let compatibilityScore = 0;

    if (isEligible) {
      // 1. Material & Pathway Compatibility (0-100)
      const matScore = 100;

      // 2. Quantity Fit (0-100)
      const qRange = buyer.maxBatchQuantityTonnes - buyer.minBatchQuantityTonnes;
      const qMid = buyer.minBatchQuantityTonnes + qRange * 0.5;
      const qDiff = Math.abs(batch.quantityTonnes - qMid);
      const qScore = Math.max(65, Math.round(100 - (qDiff / (qRange || 1)) * 35));

      // 3. Quality Compatibility (0-100)
      let qualScore = 95;
      if (batch.contaminationStatus === 'Moderate') qualScore -= 15;
      if (provisionalQualityFlag) qualScore -= 25; // penalty for unmeasured labs
      if (batch.moisturePercent !== null && batch.moisturePercent < buyer.maxMoisturePercent * 0.8) {
        qualScore = Math.min(100, qualScore + 5);
      }
      qualScore = Math.max(40, qualScore);

      // 4. Distance and Logistics (0-100)
      const distRatio = distanceKm / (buyer.maxAcceptableDistanceKm || 1);
      const distScore = Math.max(30, Math.round(100 - distRatio * 65));

      // 5. Economic Attractiveness (0-100)
      // High price and positive margin yields high score
      let econScore = 75;
      if (potentialNetValue && potentialGrossValue) {
        const margin = potentialNetValue / potentialGrossValue;
        if (margin > 0.6) econScore = 95;
        else if (margin > 0.4) econScore = 85;
        else if (margin > 0.2) econScore = 70;
        else econScore = 55;
      }

      breakdown = {
        materialPathwayScore: matScore,
        quantityScore: qScore,
        qualityScore: qualScore,
        distanceScore: distScore,
        economicScore: econScore,
      };

      const totalWeights =
        weights.materialPathwayWeight +
        weights.quantityWeight +
        weights.qualityWeight +
        weights.distanceWeight +
        weights.economicWeight;

      const rawScore =
        (matScore * weights.materialPathwayWeight +
          qScore * weights.quantityWeight +
          qualScore * weights.qualityWeight +
          distScore * weights.distanceWeight +
          econScore * weights.economicWeight) /
        (totalWeights || 1);

      compatibilityScore = Math.round(Math.min(100, Math.max(0, rawScore)));
    }

    return {
      buyer,
      batch,
      isEligible,
      rejectionReasons,
      provisionalQualityFlag,
      compatibilityScore,
      breakdown,
      potentialGrossValue: isEligible ? potentialGrossValue : null,
      estimatedTransportCost: isEligible ? estimatedTransportCost : null,
      estimatedProcessingCost: isEligible ? estimatedProcessingCost : null,
      potentialNetValue: isEligible ? potentialNetValue : null,
      matchHighlights,
      warnings,
      distanceKm,
    };
  },

  matchBatchWithAllBuyers(
    batch: ResidueBatch,
    buyers: BuyerProfile[],
    pathway: UtilizationPathway,
    weights: MatchingWeights
  ): {
    eligible: MatchResult[];
    ineligible: MatchResult[];
  } {
    const results = buyers.map((buyer) =>
      this.evaluateBuyerMatch(batch, buyer, pathway, weights)
    );

    const eligible = results
      .filter((r) => r.isEligible)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const ineligible = results.filter((r) => !r.isEligible);

    return { eligible, ineligible };
  },
};
