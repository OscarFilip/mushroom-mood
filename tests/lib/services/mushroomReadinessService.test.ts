jest.mock('@/lib/services/weatherHistoryService', () => ({
  getHistoricalWeatherData: jest.fn(),
}));

import { getMushroomReadiness, ReadinessServiceDeps } from '@/lib/services/mushroomReadinessService';
import { SeasonalObservationResult } from '@/lib/repositories/seasonalObservationRepository';
import { getHistoricalWeatherData } from '@/lib/services/weatherHistoryService';

const mockGetHistoricalWeatherData = getHistoricalWeatherData as jest.Mock;

// Fixed reference time for deterministic tests.
const FIXED_NOW = new Date('2026-09-15T12:00:00Z'); // September → in-season for porcini

function makeRainMeasurements(daysBack: number, rainPerDay: number, now = FIXED_NOW) {
  return Array.from({ length: daysBack }, (_, i) => {
    const date = new Date(now.getTime() - (i + 1) * 86_400_000);
    return { date: date.toISOString(), rainFall: rainPerDay };
  });
}

function makeTempMeasurements(daysBack: number, temp: number, now = FIXED_NOW) {
  return Array.from({ length: daysBack }, (_, i) => {
    const date = new Date(now.getTime() - (i + 1) * 86_400_000);
    return { date: date.toISOString(), temperature: temp };
  });
}

function makeMissingSeasonalRepo(): ReadinessServiceDeps['seasonalRepo'] {
  return {
    getSeasonalEvidence: jest.fn().mockResolvedValue({
      seasonalityScore: null,
      evidenceQuality: 'missing',
      radiusUsedMeters: null,
      lookbackYearsUsed: null,
      rawObservationCount: null,
      weightedObservationCount: null,
      distinctObservationYears: null,
      limitations: ['seasonal-evidence-unavailable'],
    } satisfies SeasonalObservationResult),
  };
}

function makeSparseSeasonalRepo(): ReadinessServiceDeps['seasonalRepo'] {
  return {
    getSeasonalEvidence: jest.fn().mockResolvedValue({
      seasonalityScore: null,
      evidenceQuality: 'sparse',
      radiusUsedMeters: 10000,
      lookbackYearsUsed: 10,
      rawObservationCount: 2,
      weightedObservationCount: 2,
      distinctObservationYears: 1,
      limitations: ['seasonal-evidence-expanded-radius', 'seasonal-evidence-sparse'],
    } satisfies SeasonalObservationResult),
  };
}

function makeSufficientSeasonalRepo(score: number): ReadinessServiceDeps['seasonalRepo'] {
  return {
    getSeasonalEvidence: jest.fn().mockResolvedValue({
      seasonalityScore: score,
      evidenceQuality: 'sufficient',
      radiusUsedMeters: 3000,
      lookbackYearsUsed: 10,
      rawObservationCount: 12,
      weightedObservationCount: 12,
      distinctObservationYears: 5,
      limitations: [],
    } satisfies SeasonalObservationResult),
  };
}

function makeStaleSeasonalRepo(): ReadinessServiceDeps['seasonalRepo'] {
  return {
    getSeasonalEvidence: jest.fn().mockResolvedValue({
      seasonalityScore: 80,
      evidenceQuality: 'sufficient',
      radiusUsedMeters: 3000,
      lookbackYearsUsed: 10,
      rawObservationCount: 10,
      weightedObservationCount: 10,
      distinctObservationYears: 4,
      limitations: ['seasonal-evidence-stale-cache'],
    } satisfies SeasonalObservationResult),
  };
}

describe('getMushroomReadiness', () => {
  let infoSpy: jest.SpyInstance;

  beforeEach(() => {
    delete process.env.MUSHROOM_MOOD_LOG_LEVEL;
    delete process.env.ENABLE_VERBOSE_API_LOGGING;
    jest.clearAllMocks();
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    infoSpy.mockRestore();
  });

  const defaultDeps: ReadinessServiceDeps = {
    seasonalRepo: makeMissingSeasonalRepo(),
    now: FIXED_NOW,
  };

  it('returns unknown when no rain data is available', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: null,
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.result.readinessLabel).toBe('unknown');
    expect(result.result.probabilityPercent).toBeNull();
    expect(result.limitations).toContain('weather-data-unavailable');
    expect(result.explanation.seasonalEvidence).toBeDefined();
    expect(result.explanation.seasonalEvidence.quality).toBe('missing');
  });

  it('returns unknown when rain station exists but has no measurements', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: [] },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.result.readinessLabel).toBe('unknown');
    expect(result.limitations).toContain('weather-data-unavailable');
    expect(result.explanation.seasonalEvidence).toBeDefined();
  });

  it('returns very-unlikely-right-now for out-of-season species regardless of weather', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-15T12:00:00Z'));
    try {
      // April (month 4) - cantharellus-cibarius season is June-September
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: { temperatureMeasurements: makeTempMeasurements(30, 16) },
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius');

      expect(result.result.readinessLabel).toBe('very-unlikely-right-now');
      expect(result.result.seasonalState).toBe('out-of-season');
      expect(result.result.probabilityPercent).toBeGreaterThan(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('returns correct species metadata in the response', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 3) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', defaultDeps);

    expect(result.species.id).toBe('boletus-edulis');
    expect(result.species.displayName).toBe('Porcini');
    expect(result.species.latinName).toBe('Boletus edulis');
  });

  it('includes temperature-data-unavailable limitation when no temp data', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.limitations).toContain('temperature-data-unavailable');
  });

  it('includes limited-rainfall-history limitation when fewer than 14 days of data', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(7, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.limitations).toContain('limited-rainfall-history');
  });

  it('includes spot coordinates in the response', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.spot.latitude).toBe(57.1134);
    expect(result.spot.longitude).toBe(12.7732);
  });

  it('propagates errors from the weather service', async () => {
    mockGetHistoricalWeatherData.mockRejectedValue(new Error('No nearby weather stations found'));

    await expect(
      getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps),
    ).rejects.toThrow('No nearby weather stations found');
  });

  it('returns a non-null explanation summary', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.explanation.summary).toBeTruthy();
    expect(typeof result.explanation.summary).toBe('string');
  });

  it('returns a confidence value between 5 and 95', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(90, 3) },
      temperatureStation: { temperatureMeasurements: makeTempMeasurements(90, 12) },
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'craterellus-tubaeformis', {
      seasonalRepo: makeMissingSeasonalRepo(),
      now: new Date('2026-10-01T12:00:00Z'), // October: in-season for Yellowfoot
    });

    expect(result.result.confidencePercent).toBeGreaterThanOrEqual(5);
    expect(result.result.confidencePercent).toBeLessThanOrEqual(95);
  });

  it('response includes seasonalEvidence in explanation', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: { rainFallMeasurements: makeRainMeasurements(30, 4) },
      temperatureStation: null,
    });

    const result = await getMushroomReadiness(57.1134, 12.7732, 'cantharellus-cibarius', defaultDeps);

    expect(result.explanation.seasonalEvidence).toBeDefined();
    expect(result.explanation.seasonalEvidence.quality).toBe('missing');
    expect(result.explanation).not.toHaveProperty('speciesTimingSupport');
  });

  it('logs fetched evidence and computed result details in normal mode', async () => {
    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: {
        key: 'rain-1',
        name: 'Rain Station',
        rainFallMeasurements: makeRainMeasurements(30, 3),
      },
      temperatureStation: {
        key: 'temp-1',
        name: 'Temp Station',
        temperatureMeasurements: makeTempMeasurements(30, 12),
      },
    });

    await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', defaultDeps);

    expect(infoSpy).toHaveBeenCalledWith(
      '[mushroom-readiness] fetched evidence',
      expect.objectContaining({
        rainStation: expect.objectContaining({
          key: 'rain-1',
        }),
        temperatureStation: expect.objectContaining({
          key: 'temp-1',
        }),
      }),
    );
    expect(infoSpy).toHaveBeenCalledWith(
      '[mushroom-readiness] computed result',
      expect.objectContaining({
        derivedInputs: expect.objectContaining({
          hasRainData: true,
          hasTempData: true,
        }),
        result: expect.objectContaining({
          readinessLabel: expect.any(String),
          confidencePercent: expect.any(Number),
        }),
      }),
    );
    expect(infoSpy).not.toHaveBeenCalledWith(
      '[mushroom-readiness] request',
      expect.anything(),
    );
  });

  it('logs request details in debug mode', async () => {
    process.env.MUSHROOM_MOOD_LOG_LEVEL = 'debug';

    mockGetHistoricalWeatherData.mockResolvedValue({
      rainStation: {
        key: 'rain-1',
        name: 'Rain Station',
        rainFallMeasurements: makeRainMeasurements(30, 3),
      },
      temperatureStation: {
        key: 'temp-1',
        name: 'Temp Station',
        temperatureMeasurements: makeTempMeasurements(30, 12),
      },
    });

    await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', defaultDeps);

    expect(infoSpy).toHaveBeenCalledWith(
      '[mushroom-readiness] request',
      expect.objectContaining({
        speciesId: 'boletus-edulis',
        speciesThresholds: expect.any(Object),
      }),
    );
  });

  describe('observation-backed seasonality', () => {
    it('uses observation score for seasonal state when evidence is sufficient (score 80 → in-season)', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: { temperatureMeasurements: makeTempMeasurements(30, 17) },
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeSufficientSeasonalRepo(80), // score 80 >= inSeasonMin 65
        now: FIXED_NOW,
      });

      expect(result.result.seasonalState).toBe('in-season');
      expect(result.explanation.seasonalEvidence.quality).toBe('sufficient');
      expect(result.explanation.seasonalEvidence.radiusUsedMeters).toBe(3000);
    });

    it('uses observation score for shoulder-season when score is between thresholds', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeSufficientSeasonalRepo(50), // 35 <= 50 < 65 → shoulder-season
        now: FIXED_NOW,
      });

      expect(result.result.seasonalState).toBe('shoulder-season');
      expect(result.explanation.seasonalEvidence.quality).toBe('sufficient');
    });

    it('uses observation score for out-of-season when score is below threshold', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeSufficientSeasonalRepo(20), // 20 < shoulderSeasonMin 35 → out-of-season
        now: FIXED_NOW,
      });

      expect(result.result.seasonalState).toBe('out-of-season');
      expect(result.result.readinessLabel).toBe('very-unlikely-right-now');
    });

    it('falls back to static calendar when evidence is sparse', async () => {
      // September 15 = in-season for boletus-edulis (peakMonths: 8, 9)
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeSparseSeasonalRepo(),
        now: FIXED_NOW,
      });

      // Static calendar: September → in-season for boletus-edulis
      expect(result.result.seasonalState).toBe('in-season');
      expect(result.explanation.seasonalEvidence.quality).toBe('sparse');
      expect(result.limitations).toContain('seasonal-evidence-sparse');
      expect(result.limitations).toContain('seasonal-evidence-expanded-radius');
    });

    it('falls back to static calendar when evidence is missing', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeMissingSeasonalRepo(),
        now: FIXED_NOW,
      });

      // Static calendar: September → in-season for boletus-edulis
      expect(result.result.seasonalState).toBe('in-season');
      expect(result.explanation.seasonalEvidence.quality).toBe('missing');
      expect(result.limitations).toContain('seasonal-evidence-unavailable');
      expect(result.result.confidencePercent).toBe(60);
    });

    it('uses a generic in-season missing-support summary when conditions are unfavorable', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: { temperatureMeasurements: makeTempMeasurements(30, 35) },
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-reticulatus', {
        seasonalRepo: makeMissingSeasonalRepo(),
        now: new Date('2026-07-15T12:00:00Z'),
      });

      expect(result.result.seasonalState).toBe('in-season');
      expect(result.explanation.summary).toBe(
        'Summer Porcini is in season, but current weather conditions do not support fruiting right now.',
      );
    });

    it('uses stale cached evidence with limitation when live fetch fails', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeStaleSeasonalRepo(),
        now: FIXED_NOW,
      });

      // Stale cache was sufficient (score 80), so still uses observation-backed state
      expect(result.result.seasonalState).toBe('in-season');
      expect(result.limitations).toContain('seasonal-evidence-stale-cache');
    });

    it('propagates seasonal evidence limitations into the readiness limitations array', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeSparseSeasonalRepo(),
        now: FIXED_NOW,
      });

      expect(result.limitations).toContain('seasonal-evidence-expanded-radius');
      expect(result.limitations).toContain('seasonal-evidence-sparse');
    });

    it('does not include speciesTimingSupport in explanation (removed field)', async () => {
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', defaultDeps);

      expect(result.explanation).not.toHaveProperty('speciesTimingSupport');
      expect(result.explanation).toHaveProperty('seasonalEvidence');
    });

    it('deterministic seasonal state at in-season/shoulder boundary using injected time', async () => {
      // boletus-edulis: peakMonths = [8,9], seasonMonths = [7,8,9,10]
      // October is shoulder-season in static calendar
      const octoberNow = new Date('2026-10-01T12:00:00Z');
      mockGetHistoricalWeatherData.mockResolvedValue({
        rainStation: { rainFallMeasurements: makeRainMeasurements(30, 5, octoberNow) },
        temperatureStation: null,
      });

      const result = await getMushroomReadiness(57.1134, 12.7732, 'boletus-edulis', {
        seasonalRepo: makeMissingSeasonalRepo(),
        now: octoberNow,
      });

      expect(result.result.seasonalState).toBe('shoulder-season');
    });
  });
});
