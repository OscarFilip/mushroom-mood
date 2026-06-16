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

jest.mock('@/lib/services/mushroomReadinessService', () => ({
  getMushroomReadiness: jest.fn(),
}));

import { GET } from '@/app/api/mushroom-readiness/route';
import { getMushroomReadiness } from '@/lib/services/mushroomReadinessService';
import { getServerSession } from 'next-auth';
import { isBetaAllowed } from '@/lib/auth/allowlist';

const mockGetServerSession = getServerSession as jest.Mock;
const mockIsBetaAllowed = isBetaAllowed as jest.Mock;

const mockGetMushroomReadiness = getMushroomReadiness as jest.Mock;

const VALID_RESULT = {
  checkedAt: '2026-09-15T12:00:00.000Z',
  spot: { latitude: 57.1134, longitude: 12.7732 },
  species: { id: 'cantharellus-cibarius', displayName: 'Golden Chanterelle', latinName: 'Cantharellus cibarius' },
  result: {
    readinessLabel: 'very-unlikely-right-now',
    probabilityPercent: 5,
    confidencePercent: 62,
    seasonalState: 'out-of-season',
  },
  explanation: {
    summary: 'Out of season.',
    weatherSupport: 'partial',
    seasonalSupport: 'missing',
    seasonalEvidence: {
      quality: 'missing',
      source: 'species-calendar',
      radiusUsedMeters: null,
      lookbackYearsUsed: null,
      rawObservationCount: null,
      weightedObservationCount: null,
      distinctObservationYears: null,
    },
  },
  weatherEvidence: {
    rain3DayMm: 6,
    rain7DayMm: 14,
    rain14DayMm: 28,
    rain30DayMm: 45,
    rainHistoryDays: 30,
    averageTemperature7DayC: 16,
    rainStationName: null,
    temperatureStationName: null,
  },
  limitations: [],
};

describe('GET /api/mushroom-readiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockIsBetaAllowed.mockReturnValue(true);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=cantharellus-cibarius');
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 when authenticated but not on beta allowlist', async () => {
    mockIsBetaAllowed.mockReturnValue(false);
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=cantharellus-cibarius');
    const response = await GET(request);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('returns 400 when latitude or longitude is missing', async () => {
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&species=cantharellus-cibarius');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Latitude and longitude are required' });
    expect(mockGetMushroomReadiness).not.toHaveBeenCalled();
  });

  it('returns 400 when species is missing', async () => {
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Species is required' });
    expect(mockGetMushroomReadiness).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown species id', async () => {
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=unicorn-mushroom');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/Unknown species/);
    expect(mockGetMushroomReadiness).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid coordinates', async () => {
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=91&longitude=12.7732&species=cantharellus-cibarius');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/Latitude/);
  });

  it('returns 400 for malformed numeric coordinates', async () => {
    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57abc&longitude=12.7732xyz&species=cantharellus-cibarius');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Latitude and longitude must be valid numbers' });
    expect(mockGetMushroomReadiness).not.toHaveBeenCalled();
  });

  it('returns 200 with readiness result for valid inputs', async () => {
    mockGetMushroomReadiness.mockResolvedValue(VALID_RESULT);

    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=cantharellus-cibarius');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetMushroomReadiness).toHaveBeenCalledWith(57.1134, 12.7732, 'cantharellus-cibarius');
    expect(body).toEqual(VALID_RESULT);
  });

  it('returns 404 when no nearby weather stations are found', async () => {
    mockGetMushroomReadiness.mockRejectedValue(new Error('No nearby weather stations found'));

    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=boletus-edulis');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'No nearby weather stations found' });
  });

  it('returns 500 when no weather stations are available', async () => {
    mockGetMushroomReadiness.mockRejectedValue(new Error('No weather stations available'));

    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=boletus-edulis');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'No weather stations available' });
  });

  it('returns 500 for unexpected errors', async () => {
    mockGetMushroomReadiness.mockRejectedValue(new Error('Unexpected failure'));

    const request = new Request('http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=boletus-edulis');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal server error' });
  });

  it('accepts all four curated species ids', async () => {
    mockGetMushroomReadiness.mockResolvedValue(VALID_RESULT);

    const ids = ['boletus-edulis', 'boletus-reticulatus', 'cantharellus-cibarius', 'craterellus-tubaeformis'];
    for (const id of ids) {
      const request = new Request(`http://localhost/api/mushroom-readiness?latitude=57.1134&longitude=12.7732&species=${id}`);
      const response = await GET(request);
      expect(response.status).toBe(200);
    }
  });
});
