import { SpeciesObservationRepository } from '../repositories/speciesObservationRepository';
import { SpeciesObservation } from '../models/SpeciesObservation';

interface SpeciesObservationSearchRequest {
  speciesId: number;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

interface SpeciesObservationSearchResponse {
  observations: Array<{
    id: string;
    scientificName: string;
    vernacularName?: string;
    date: string;
    latitude: number;
    longitude: number;
    uncertainty?: number;
    locality?: string;
    municipality?: string;
    county?: string;
    individualCount?: number;
    verificationStatus?: string;
  }>;
  totalCount: number;
  searchParams: {
    speciesId: number;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
}

// Constants
const ERROR_MESSAGES = {
  NO_OBSERVATIONS_FOUND: 'No observations found for the specified criteria',
  INVALID_SPECIES_ID: 'Invalid species ID provided',
  INVALID_COORDINATES: 'Invalid coordinates provided'
} as const;

const DEFAULT_RADIUS_METERS = 3000;

export async function searchSpeciesObservations(
  params: SpeciesObservationSearchRequest
): Promise<SpeciesObservationSearchResponse> {
  const repository = new SpeciesObservationRepository();
  
  try {
    validateSearchParams(params);

    const radiusMeters = params.radiusMeters || DEFAULT_RADIUS_METERS;

    // Get observations from the repository
    const response = await repository.getObservationsBySpeciesId(
      params.speciesId,
      params.latitude,
      params.longitude,
      radiusMeters
    );

    // Transform the response
    const transformedObservations = transformObservations(response.records || []);

    console.log(`🍄 Found ${transformedObservations.length} observations for species ${params.speciesId}`);

    return {
      observations: transformedObservations,
      totalCount: response.count || transformedObservations.length,
      searchParams: {
        speciesId: params.speciesId,
        latitude: params.latitude,
        longitude: params.longitude,
        radiusMeters
      }
    };

  } catch (error) {
    console.error('Error in searchSpeciesObservations:', error);
    throw error;
  }
}

// Helper functions
function validateSearchParams(params: SpeciesObservationSearchRequest): void {
  if (!params.speciesId || !Number.isInteger(params.speciesId) || params.speciesId <= 0) {
    throw new Error(ERROR_MESSAGES.INVALID_SPECIES_ID);
  }

  if (!params.latitude || !params.longitude) {
    throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
  }

  if (Math.abs(params.latitude) > 90 || Math.abs(params.longitude) > 180) {
    throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
  }
}

function transformObservations(observations: SpeciesObservation[]) {
  return observations.map(obs => ({
    id: obs.id,
    scientificName: obs.taxon.scientificName,
    vernacularName: obs.taxon.vernacularName,
    date: obs.event.plainStartDate || obs.event.startDate,
    latitude: obs.location.decimalLatitude,
    longitude: obs.location.decimalLongitude,
    uncertainty: obs.location.coordinateUncertaintyInMeters,
    locality: obs.location.locality,
    municipality: obs.location.municipality,
    county: obs.location.county,
    individualCount: obs.occurrence.individualCount,
    verificationStatus: obs.identification.verificationStatus
  }));
}