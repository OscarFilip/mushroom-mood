jest.mock('next-auth', () => ({
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock('@/app/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/auth/allowlist', () => ({
  isBetaAllowed: jest.fn().mockReturnValue(true),
}));

jest.mock('@/lib/services/weatherHistoryService', () => ({
  getHistoricalWeatherData: jest.fn(),
}));

import { GET } from '@/app/api/weather-history/rainy-days/route';
import { getHistoricalWeatherData } from '@/lib/services/weatherHistoryService';
import { getServerSession } from 'next-auth';
import { isBetaAllowed } from '@/lib/auth/allowlist';

const mockGetServerSession = getServerSession as jest.Mock;
const mockIsBetaAllowed = isBetaAllowed as jest.Mock;

describe('GET /api/weather-history/rainy-days', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockIsBetaAllowed.mockReturnValue(true);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134&longitude=12.7732');
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 when authenticated but not on beta allowlist', async () => {
    mockIsBetaAllowed.mockReturnValue(false);
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134&longitude=12.7732');
    const response = await GET(request);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('returns 400 when latitude or longitude is missing', async () => {
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Latitude and longitude are required' });
    expect(getHistoricalWeatherData).not.toHaveBeenCalled();
  });

  it('returns 400 when coordinates are invalid', async () => {
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=91&longitude=12.7732');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Latitude must be between -90 and 90 degrees' });
    expect(getHistoricalWeatherData).not.toHaveBeenCalled();
  });

  it('returns 200 with weather history data for valid coordinates', async () => {
    const serviceResponse = {
      rainStation: {
        id: 11,
        key: 'rain-1',
        name: 'Rain Station',
        title: 'Rain Station Title',
        latitude: 57.11,
        longitude: 12.77,
        active: true,
        rainFallMeasurements: [{ date: '2026-01-10T00:00:00.000Z', rainFall: 5.4 }],
      },
      temperatureStation: null,
    };

    (getHistoricalWeatherData as jest.Mock).mockResolvedValue(serviceResponse);
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134&longitude=12.7732');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getHistoricalWeatherData).toHaveBeenCalledWith(57.1134, 12.7732);
    expect(body).toEqual(serviceResponse);
  });

  it('returns 404 when no nearby weather station is available', async () => {
    (getHistoricalWeatherData as jest.Mock).mockRejectedValue(new Error('No nearby weather stations found'));
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134&longitude=12.7732');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'No nearby weather stations found' });
  });

  it('returns 500 when no weather stations are available', async () => {
    (getHistoricalWeatherData as jest.Mock).mockRejectedValue(new Error('No weather stations available'));
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134&longitude=12.7732');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'No weather stations available' });
  });

  it('returns 500 for unexpected internal errors', async () => {
    (getHistoricalWeatherData as jest.Mock).mockRejectedValue(new Error('Unexpected failure'));
    const request = new Request('http://localhost/api/weather-history/rainy-days?latitude=57.1134&longitude=12.7732');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal server error' });
  });
});
