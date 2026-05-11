import { NextResponse } from 'next/server';
import { getMushroomReadiness } from '../../../lib/services/mushroomReadinessService';
import { isValidSpeciesId } from '../../../lib/data/mushroomSpecies';
import { validateCoordinates } from '../../../lib/utils/validation';

function parseCoordinate(value: string): number {
  if (!/^-?\d+(?:\.\d+)?$/.test(value.trim())) {
    throw new Error('Latitude and longitude must be valid numbers');
  }

  return Number(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const species = searchParams.get('species');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 },
      );
    }

    if (!species) {
      return NextResponse.json({ error: 'Species is required' }, { status: 400 });
    }

    const lat = parseCoordinate(latitude);
    const lon = parseCoordinate(longitude);

    validateCoordinates(lat, lon);

    if (!isValidSpeciesId(species)) {
      return NextResponse.json({ error: `Unknown species: ${species}` }, { status: 400 });
    }

    const result = await getMushroomReadiness(lat, lon, species);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in mushroom readiness API:', error);

    if (
      error.message?.includes('Latitude') ||
      error.message?.includes('longitude') ||
      error.message?.includes('degrees')
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (
      error.message === 'No nearby weather station found' ||
      error.message === 'No nearby weather stations found'
    ) {
      return NextResponse.json(
        { error: 'No nearby weather stations found' },
        { status: 404 },
      );
    }

    if (error.message === 'No weather stations available') {
      return NextResponse.json(
        { error: 'No weather stations available' },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
