import { NextResponse } from 'next/server';
import { searchSpeciesObservations } from '../../../../lib/services/speciesObservationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { speciesId, latitude, longitude, radiusMeters } = body;

    // Validate required parameters
    if (!speciesId || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'speciesId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // Parse and validate numeric values
    const parsedSpeciesId = parseInt(speciesId.toString());
    const parsedLatitude = parseFloat(latitude.toString());
    const parsedLongitude = parseFloat(longitude.toString());
    const parsedRadius = radiusMeters ? parseFloat(radiusMeters.toString()) : undefined;

    if (isNaN(parsedSpeciesId) || isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
      return NextResponse.json(
        { error: 'Invalid numeric values provided' },
        { status: 400 }
      );
    }

    const data = await searchSpeciesObservations({
      speciesId: parsedSpeciesId,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      radiusMeters: parsedRadius
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in species observations API:', error);
    
    if (error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message.includes('No observations found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}