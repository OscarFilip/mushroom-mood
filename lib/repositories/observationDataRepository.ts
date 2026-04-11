import { ApiClient } from './apiClient';
import { SpeciesObservationRequest, SpeciesObservationResponse } from '../models/SpeciesObservation';

export class ObservationDataRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient('https://api.artdatabanken.se/species-observation-system/v1', {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  public async searchObservationsAsync(request: SpeciesObservationRequest): Promise<SpeciesObservationResponse> {
    try {
      console.log('🔍 Searching species observations with:', JSON.stringify(request, null, 2));
      
      const response = await this.apiClient.post<SpeciesObservationResponse>(
        '/Observations/Search',
        request
      );

      console.log(`✅ Found ${response.records?.length || 0} observations`);
      return response;

    } catch (error) {
      console.error('Failed to search species observations:', error);
      throw error;
    }
  }

  public async getObservationsBySpeciesId(
    speciesId: number,
    latitude: number,
    longitude: number,
    radiusMeters: number = 3000
  ): Promise<SpeciesObservationResponse> {
    const request: SpeciesObservationRequest = {
      taxon: {
        ids: [speciesId]
      },
      includeUnderlyingTaxa: false,
      geographics: {
        geometries: [
          {
            type: "point",
            coordinates: [longitude, latitude] // Note: longitude first!
          }
        ],
        maxDistanceFromPoint: radiusMeters
      }
    };

    return this.searchObservationsAsync(request);
  }
}