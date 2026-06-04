export type SpeciesId =
  | 'boletus-edulis'
  | 'boletus-reticulatus'
  | 'cantharellus-cibarius'
  | 'craterellus-tubaeformis';

export interface MushroomSpeciesProfile {
  id: SpeciesId;
  displayName: string;
  latinName: string;
  /**
   * ArtDatabanken Dyntaxa taxon ID. Used for runtime observation search.
   * IDs were confirmed (boletus-edulis) or estimated from Dyntaxa records and
   * should be verified against the live ArtDatabanken taxon search endpoint
   * during restricted species onboarding for each species.
   */
  taxonId: number;
  seasonMonths: number[];
  peakMonths: number[];
  minTempC: number;
  optimalMinTempC: number;
  optimalMaxTempC: number;
  maxTempC: number;
  minRain7DayMm: number;
  optimalRain7DayMm: number;
  minRain14DayMm: number;
}

export const CURATED_SPECIES: Record<SpeciesId, MushroomSpeciesProfile> = {
  'boletus-edulis': {
    id: 'boletus-edulis',
    displayName: 'Porcini',
    latinName: 'Boletus edulis',
    taxonId: 245630, // confirmed via live ArtDatabanken radius probe (Ullared, 2024)
    seasonMonths: [7, 8, 9, 10],
    peakMonths: [8, 9],
    minTempC: 10,
    optimalMinTempC: 15,
    optimalMaxTempC: 22,
    maxTempC: 28,
    minRain7DayMm: 15,
    optimalRain7DayMm: 35,
    minRain14DayMm: 30,
  },
  'boletus-reticulatus': {
    id: 'boletus-reticulatus',
    displayName: 'Summer Porcini',
    latinName: 'Boletus reticulatus',
    taxonId: 3135, // verified via ArtDatabanken Taxon Search (2026-06-04)
    seasonMonths: [6, 7, 8, 9],
    peakMonths: [6, 7, 8],
    minTempC: 15,
    optimalMinTempC: 18,
    optimalMaxTempC: 26,
    maxTempC: 32,
    minRain7DayMm: 15,
    optimalRain7DayMm: 30,
    minRain14DayMm: 25,
  },
  'cantharellus-cibarius': {
    id: 'cantharellus-cibarius',
    displayName: 'Golden Chanterelle',
    latinName: 'Cantharellus cibarius',
    taxonId: 3213, // verified via ArtDatabanken Taxon Search (2026-06-04)
    seasonMonths: [6, 7, 8, 9],
    peakMonths: [7, 8],
    minTempC: 12,
    optimalMinTempC: 15,
    optimalMaxTempC: 22,
    maxTempC: 28,
    minRain7DayMm: 10,
    optimalRain7DayMm: 25,
    minRain14DayMm: 20,
  },
  'craterellus-tubaeformis': {
    id: 'craterellus-tubaeformis',
    displayName: 'Yellowfoot',
    latinName: 'Craterellus tubaeformis',
    taxonId: 3217, // verified via ArtDatabanken Taxon Search (2026-06-04)
    seasonMonths: [9, 10, 11],
    peakMonths: [9, 10],
    minTempC: 3,
    optimalMinTempC: 8,
    optimalMaxTempC: 16,
    maxTempC: 22,
    minRain7DayMm: 8,
    optimalRain7DayMm: 20,
    minRain14DayMm: 15,
  },
};

export const SPECIES_ID_LIST = Object.keys(CURATED_SPECIES) as SpeciesId[];

export function isValidSpeciesId(id: string): id is SpeciesId {
  return id in CURATED_SPECIES;
}
