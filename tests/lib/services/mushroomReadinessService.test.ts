jest.mock('@/lib/services/rainHistoryService', () => ({
  getHistoricalWeatherData: jest.fn(),
}));

import { getMushroomReadiness } from '@/lib/services/mushroomReadinessService';
import { getHistoricalWeatherData } from '@/lib/services/rainHistoryService';

const mockGetHistoricalWeatherData = getHistoricalWeatherData as jest.Mock;

function makeRainMeasurements(daysBack: number, rainPerDay: number) {
  const now = new Date();
  return Array.from({ length: daysBack }, (_, i) => {
    const date = new Date(now.getTime() - (i + 1) * 86_400_000);
    return { date: date.toISOString(), rainFall: rainPerDay };
  });
}

function makeTempMeasurements(daysBack: number, temp: number) {
  const now = new Date();
  return Array.from({ length: daysBack }, (_, i) => {
    const date = new Date(now.getTime() - (i + 1) * 86_400_000);
    return { date: date.toISOString(), temperature: temp };
  });
}

describe('getMushroomReadiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unknown when no rain data is available', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: null,
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.result.readinessLabel).toBe('unknown');
    expect(result.result.probabilityPercent).toBeNull();
    expect(result.limitations).toContain('weather-data-unavailable');
  });

  it('returns unknown when rain station exists but has no measurements', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: [] },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.result.readinessLabel).toBe('unknown');
    expect(result.limitations).toContain('weather-data-unavailable');
  });

  it('returns very-unlikely-right-now for out-of-season species regardless of weather', async () => {
    // April (month 4) — cantharellus-cibarius season is June-September
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
      temperatureStation: { temperatureMeasurements: makeTempMeasurements(30, 16) },
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.result.readinessLabel).toBe('very-unlikely-right-now');
    expect(result.result.seasonalState).toBe('out-of-season');
    expect(result.result.probabilityPercent).toBeGreaterThan(0);
  });

  it('returns correct species metadata in the response', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 3) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis');

    expect(result.species.id).toBe('boletus-edulis');
    expect(result.species.displayName).toBe('Porcini');
    expect(result.species.latinName).toBe('Boletus edulis');
  });

  it('includes temperature-data-unavailable limitation when no temp data', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.limitations).toContain('temperature-data-unavailable');
  });

  it('includes limited-rainfall-history limitation when fewer than 14 days of data', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(7, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.limitations).toContain('limited-rainfall-history');
  });

  it('includes spot coordinates in the response', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.spot.latitude).toBe(57.1134);
    expect(result.spot.longitude).toBe(12.7732);
  });

  it('propagates errors from the weather service', async () => {
    mockGetHistoricalWeatherData.mockRejectedValue(new Error('No nearby weather stations found'));

    await expect(
      getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius'),
    ).rejects.toThrow('No nearby weather stations found');
  });

  it('returns a non-null explanation summary', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

    expect(result.explanation.summary).toBeTruthy();
    expect(typeof result.explanation.summary).toBe('string');
  });

  it('returns a confidence value between 5 and 95', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(90, 3) },
      temperatureStation: { temperatureMeasurements: makeTempMeasurements(90, 12) },
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'craterellus-tubaeformis');

    expect(result.result.confidencePercent).toBeGreaterThanOrEqual(5);
    expect(result.result.confidencePercent).toBeLessThanOrEqual(95);
  });
});
