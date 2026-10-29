import { PathwayDetail, ResidueType, UtilizationPathway } from '../types';
import { PATHWAY_KNOWLEDGE_BASE } from '../data/seedData';

export const recoveryService = {
  getAllPathways(): PathwayDetail[] {
    return PATHWAY_KNOWLEDGE_BASE;
  },

  getPathwaysForResidue(residueType: ResidueType): PathwayDetail[] {
    return PATHWAY_KNOWLEDGE_BASE.filter((p) => p.residueType === residueType);
  },

  getPathwayDetail(residueType: ResidueType, pathwayName: UtilizationPathway): PathwayDetail | undefined {
    return PATHWAY_KNOWLEDGE_BASE.find(
      (p) => p.residueType === residueType && p.pathwayName === pathwayName
    );
  },

  getPathwayById(id: string): PathwayDetail | undefined {
    return PATHWAY_KNOWLEDGE_BASE.find((p) => p.id === id);
  },

  getAllResidueTypes(): ResidueType[] {
    return [
      'Rice husk',
      'Rice straw',
      'Coconut husk',
      'Coconut shell',
      'Groundnut shell',
      'Maize cob',
      'Sugarcane bagasse',
      'Wheat straw',
      'Coffee husk',
    ];
  },

  comparePathways(pathwayAId: string, pathwayBId: string): {
    pathwayA: PathwayDetail | undefined;
    pathwayB: PathwayDetail | undefined;
  } {
    return {
      pathwayA: this.getPathwayById(pathwayAId),
      pathwayB: this.getPathwayById(pathwayBId),
    };
  },
};
