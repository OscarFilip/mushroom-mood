import { NextResponse } from 'next/server';
import { getHistoricalWeatherData } from '../../../../lib/services/rainHistoryService';
import { validateCoordinates } from '../../../../lib/utils/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    validateCoordinates(lat, lon);

    const data = await getHistoricalWeatherData(lat, lon);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in weather history API:', error);
    
    if (error.message.includes('Latitude') || 
        error.message.includes('longitude') || 
        error.message.includes('degrees')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message === 'No weather stations available') {
      return NextResponse.json(
        { error: 'No weather stations available' },
        { status: 500 }
      );
    }
    
    if (error.message === 'No nearby weather station found' ||
        error.message === 'No nearby weather stations found') {
      return NextResponse.json(
        { error: 'No nearby weather stations found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}