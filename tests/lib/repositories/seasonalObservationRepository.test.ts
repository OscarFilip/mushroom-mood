import {
  SeasonalObservationRepository,
  SeasonalObservationParams,
  computeCircularKernelScore,
} from '@/lib/repositories/seasonalObservationRepository';
import { SEASONAL_OBSERVATION_POLICY } from '@/lib/data/seasonalObservationPolicy';

// Fixed date for deterministic tests: 15 September (day ~258, peak porcini season)
const FIXED_NOW = new Date('2026-09-15T12:00:00Z');
const BASE_PARAMS: SeasonalObservationParams = {
  latitude: 57.1134,
  longitude: 12.7732,
  taxonId: 245630,
  now: FIXED_NOW,
};

function makeObservationResponse(observations: object[]) {
  return {
    ok: true,
    json: async () => ({ totalCount: observations.length, records: observations }),
  } as Response;
}

function makeArtportalenObs(dateStr: string, verified = true, uncertainIdentification = false) {
  return {
    event: { startDate: dateStr, endDate: dateStr },
    datasetName: 'Artportalen',
    identification: { verified, uncertainIdentification },
  };
}

function makeFetchMock(...responses: Response[]) {
  let callIndex = 0;
  return jest.fn(async () => {
    const response = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return response;
  }) as unknown as typeof fetch;
}

// Helper: build N Artportalen observations spread across the specified years,
// all on day-of-year 258 (mid-September) to keep scoring deterministic.
function buildObsAcrossYears(years: number[]): object[] {
  return years.map((year) => makeArtportalenObs(`${year}-09-15`));
}

describe('SeasonalObservationRepository', () => {
  describe('when no API key is configured', () => {
    it('returns missing evidence without making any network call', async () => {
      const fetchMock = jest.fn();
      const repo = new SeasonalObservationRepository(undefined, SEASONAL_OBSERVATION_POLICY, fetchMock as any);

      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('missing');
      expect(result.seasonalityScore).toBeNull();
      expect(result.limitations).toContain('seasonal-evidence-unavailable');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('sufficient evidence path', () => {
    it('returns sufficient quality and a non-null score when thresholds are met', async () => {
      // 5 verified Artportalen observations across 4 distinct years within last 10 years
      const obs = buildObsAcrossYears([2022, 2022, 2023, 2024, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('sufficient');
      expect(result.seasonalityScore).not.toBeNull();
      expect(result.seasonalityScore).toBeGreaterThanOrEqual(0);
      expect(result.seasonalityScore).toBeLessThanOrEqual(100);
      expect(result.limitations).not.toContain('seasonal-evidence-unavailable');
      expect(result.limitations).not.toContain('seasonal-evidence-sparse');
    });

    it('does not include expanded-radius limitation when primary radius is sufficient', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('sufficient');
      expect(result.radiusUsedMeters).toBe(SEASONAL_OBSERVATION_POLICY.search.primaryRadiusMeters);
      expect(result.limitations).not.toContain('seasonal-evidence-expanded-radius');
    });

    it('returns the correct radius and lookback when primary radius is sufficient', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.radiusUsedMeters).toBe(3000);
      expect(result.lookbackYearsUsed).toBe(10);
    });
  });

  describe('radius expansion', () => {
    it('expands radius when primary radius has sparse evidence and stops at a sufficient radius', async () => {
      // 3km: 1 obs (sparse); 5km: 5 obs across 4 years (sufficient)
      const sparse = buildObsAcrossYears([2024]);
      const sufficient = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);

      const fetchMock = makeFetchMock(
        makeObservationResponse(sparse),   // 3km
        makeObservationResponse(sufficient), // 5km — stops here
      );

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('sufficient');
      expect(result.radiusUsedMeters).toBe(5000);
      expect(result.limitations).toContain('seasonal-evidence-expanded-radius');
      // Only 2 API calls: 3km and 5km
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('includes sparse limitation when all base-lookback radii are exhausted and evidence is still sparse', async () => {
      // All radii return only 2 obs (sparse); expanded lookback also sparse
      const sparseObs = buildObsAcrossYears([2024, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(sparseObs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      // radiusStepsMeters has 4 steps + 1 expanded lookback = 5 calls
      expect(fetchMock).toHaveBeenCalledTimes(5);
      expect(result.evidenceQuality).toBe('sparse');
      expect(result.limitations).toContain('seasonal-evidence-sparse');
      expect(result.limitations).toContain('seasonal-evidence-expanded-radius');
    });

    it('returns missing when all radii and expanded lookback find no observations', async () => {
      const fetchMock = makeFetchMock(makeObservationResponse([]));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('missing');
      expect(result.seasonalityScore).toBeNull();
      expect(result.limitations).toContain('seasonal-evidence-unavailable');
    });
  });

  describe('lookback expansion', () => {
    it('includes expanded-lookback limitation when extra years were needed', async () => {
      // Base lookback (all radii): 2 obs (sparse)
      // Expanded lookback at max radius: 5 obs across 4 years (or still sparse but more obs)
      const sparseObs = buildObsAcrossYears([2024, 2025]);
      const expandedObs = [
        ...sparseObs,
        makeArtportalenObs('2014-09-15'), // older record only in expanded window
        makeArtportalenObs('2015-09-15'),
        makeArtportalenObs('2016-09-15'),
      ];

      const fetchMock = makeFetchMock(
        makeObservationResponse(sparseObs), // 3km base
        makeObservationResponse(sparseObs), // 5km base
        makeObservationResponse(sparseObs), // 10km base
        makeObservationResponse(sparseObs), // 15km base
        makeObservationResponse(expandedObs), // 15km expanded lookback
      );

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.lookbackYearsUsed).toBe(SEASONAL_OBSERVATION_POLICY.search.expandedLookbackYears);
      expect(result.limitations).toContain('seasonal-evidence-expanded-lookback');
    });
  });

  describe('dataset filtering', () => {
    it('excludes observations from unlisted datasets', async () => {
      const obs = [
        { event: { startDate: '2024-09-15', endDate: '2024-09-15' }, datasetName: 'SomeUnknownDataset', identification: { verified: true, uncertainIdentification: false } },
        makeArtportalenObs('2024-09-15'),
      ];
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      // Only 1 allowed observation remains
      expect(result.weightedObservationCount).toBeCloseTo(1.0);
    });

    it('applies dataset weight for iNaturalist observations', async () => {
      const obs = [
        { event: { startDate: '2024-09-15', endDate: '2024-09-15' }, datasetName: 'iNaturalist', identification: { verified: true, uncertainIdentification: false } },
      ];
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      // iNaturalist weight = 0.9, verifiedCertain = 1.0 → total weight = 0.9
      expect(result.weightedObservationCount).toBeCloseTo(0.9);
    });
  });

  describe('verification weighting', () => {
    it('applies lower weight for uncertain observations', async () => {
      const obs = [
        {
          event: { startDate: '2024-09-15', endDate: '2024-09-15' },
          datasetName: 'Artportalen',
          identification: { verified: true, uncertainIdentification: true },
        },
      ];
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      // Artportalen weight = 1.0, uncertain = 0.2 → total = 0.2
      expect(result.weightedObservationCount).toBeCloseTo(0.2);
    });

    it('applies unverified weight for observations without explicit verification', async () => {
      const obs = [
        {
          event: { startDate: '2024-09-15', endDate: '2024-09-15' },
          datasetName: 'Artportalen',
          identification: { verified: false, uncertainIdentification: false },
        },
      ];
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      // Artportalen = 1.0, unverifiedCertain = 0.6 → total = 0.6
      expect(result.weightedObservationCount).toBeCloseTo(0.6);
    });
  });

  describe('in-memory cache', () => {
    it('returns a fresh cached result without making another API call', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);

      const first = await repo.getSeasonalEvidence(BASE_PARAMS);
      const second = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(fetchMock).toHaveBeenCalledTimes(1); // Only one API call
      expect(second).toEqual(first);
    });

    it('refetches after TTL has expired', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));
      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);

      const t0 = new Date('2026-09-15T12:00:00Z');
      await repo.getSeasonalEvidence({ ...BASE_PARAMS, now: t0 });

      // 25 hours later: cache is stale
      const t1 = new Date(t0.getTime() + 25 * 60 * 60 * 1000);
      await repo.getSeasonalEvidence({ ...BASE_PARAMS, now: t1 });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('reuses stale cache when live fetch fails and entry is within 7-day window', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const successFetch = makeObservationResponse(obs);
      const failFetch = { ok: false, status: 503, statusText: 'Service Unavailable' } as Response;

      const fetchMock = makeFetchMock(successFetch, failFetch);
      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);

      const t0 = new Date('2026-09-15T12:00:00Z');
      const firstResult = await repo.getSeasonalEvidence({ ...BASE_PARAMS, now: t0 });

      // 48 hours later: cache stale, live fetch fails
      const t1 = new Date(t0.getTime() + 48 * 60 * 60 * 1000);
      const secondResult = await repo.getSeasonalEvidence({ ...BASE_PARAMS, now: t1 });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(secondResult.evidenceQuality).toBe(firstResult.evidenceQuality);
      expect(secondResult.limitations).toContain('seasonal-evidence-stale-cache');
    });

    it('returns missing evidence when live fetch fails and no usable stale cache exists', async () => {
      const failFetch = { ok: false, status: 503, statusText: 'Service Unavailable' } as Response;
      const fetchMock = makeFetchMock(failFetch);
      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);

      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('missing');
      expect(result.limitations).toContain('seasonal-evidence-unavailable');
    });
  });

  describe('evidence fields', () => {
    it('returns weighted observation count and distinct years', async () => {
      // 3 verified observations across 3 distinct years but only 1 within the last 10 years
      // → sparse (recentDistinctYears < 2), but fields should be populated
      const obs = buildObsAcrossYears([2024, 2024, 2024]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      // All three in same year → distinctYears = 1
      expect(result.rawObservationCount).toBe(3);
      expect(result.weightedObservationCount).toBeCloseTo(3.0);
      expect(result.distinctObservationYears).toBe(1);
    });

    it('classifies valid live-style low-volume observations as sparse rather than missing', async () => {
      const obs = [
        makeArtportalenObs('2021-08-19T00:00:00+02:00', false, false),
        makeArtportalenObs('2022-10-23T00:00:00+02:00', false, false),
        makeArtportalenObs('2020-09-15T00:00:00+02:00', false, false),
      ];
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).toBe('sparse');
      expect(result.rawObservationCount).toBe(3);
      expect(result.weightedObservationCount).toBeCloseTo(1.8);
      expect(result.distinctObservationYears).toBe(3);
      expect(result.limitations).toContain('seasonal-evidence-sparse');
      expect(result.limitations).not.toContain('seasonal-evidence-unavailable');
    });

    it('returns null score for non-sufficient evidence', async () => {
      const obs = buildObsAcrossYears([2024]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      const result = await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(result.evidenceQuality).not.toBe('sufficient');
      expect(result.seasonalityScore).toBeNull();
    });
  });

  describe('API request structure', () => {
    it('sends the taxon ID, coordinates, and date range in the POST body', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-key', SEASONAL_OBSERVATION_POLICY, fetchMock);
      await repo.getSeasonalEvidence(BASE_PARAMS);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = (fetchMock as jest.Mock).mock.calls[0];
      const body = JSON.parse(init.body);

      expect(url).toBe(SEASONAL_OBSERVATION_POLICY.source.observationSearchUrl);
      expect(body.filter).toBeUndefined();
      expect(body.taxon.ids).toContain(245630);
      expect(body.includeUnderlyingTaxa).toBe(true);
      expect(body.geographics.geometries[0].type).toBe('point');
      expect(body.geographics.geometries[0].coordinates).toEqual([12.7732, 57.1134]);
      expect(body.geographics.maxDistanceFromPoint).toBe(3000);
      expect(body.date.startDate).toBe('2016-01-01'); // 2026 - 10
      expect(body.date.endDate).toBe('2026-12-31');
    });

    it('includes the API key in the auth header', async () => {
      const obs = buildObsAcrossYears([2022, 2023, 2024, 2025, 2025]);
      const fetchMock = makeFetchMock(makeObservationResponse(obs));

      const repo = new SeasonalObservationRepository('test-api-key-xyz', SEASONAL_OBSERVATION_POLICY, fetchMock);
      await repo.getSeasonalEvidence(BASE_PARAMS);

      const [, init] = (fetchMock as jest.Mock).mock.calls[0];
      expect(init.headers[SEASONAL_OBSERVATION_POLICY.source.authHeaderName]).toBe('test-api-key-xyz');
    });
  });
});

describe('computeCircularKernelScore', () => {
  it('returns 100 when all observations are on today', () => {
    const today = 258; // ~September 15
    const obs = [
      { dayOfYear: today, year: 2024, weight: 1 },
      { dayOfYear: today, year: 2023, weight: 1 },
    ];
    expect(computeCircularKernelScore(obs, today, 30)).toBe(100);
  });

  it('returns 0 when today is far from all observations', () => {
    // All observations in March (~day 74), today in September (~day 258)
    const obs = [
      { dayOfYear: 74, year: 2024, weight: 1 },
      { dayOfYear: 74, year: 2023, weight: 1 },
    ];
    // Distance = 258-74 = 184, which exceeds windowDays=30 → kernel value is 0
    expect(computeCircularKernelScore(obs, 258, 30)).toBe(0);
  });

  it('returns 0 for empty observations', () => {
    expect(computeCircularKernelScore([], 100, 30)).toBe(0);
  });

  it('returns a score between 0 and 100 for partial overlap', () => {
    const obs = [
      { dayOfYear: 240, year: 2024, weight: 1 }, // 18 days before today (258)
    ];
    const score = computeCircularKernelScore(obs, 258, 30);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('handles year boundary wrap-around for circular distance', () => {
    // observation on day 5 (early January), today on day 360 (late December)
    // distance should be min(355, 365-355) = min(355, 10) = 10, which is within 30-day window
    const obs = [{ dayOfYear: 5, year: 2024, weight: 1 }];
    const score = computeCircularKernelScore(obs, 360, 30);
    expect(score).toBeGreaterThan(0);
  });
});
