import {
  SEASONAL_OBSERVATION_POLICY,
  SeasonalEvidenceQuality,
  SeasonalObservationDataset,
  SeasonalObservationPolicy,
} from '../data/seasonalObservationPolicy';

export interface SeasonalObservationResult {
  seasonalityScore: number | null;
  evidenceQuality: SeasonalEvidenceQuality;
  radiusUsedMeters: number | null;
  lookbackYearsUsed: number | null;
  rawObservationCount: number | null;
  weightedObservationCount: number | null;
  distinctObservationYears: number | null;
  limitations: string[];
}

export interface SeasonalObservationParams {
  latitude: number;
  longitude: number;
  taxonId: number;
  now?: Date;
}

interface CacheEntry {
  result: SeasonalObservationResult;
  cachedAt: number;
}

// Raw observation shape from ArtDatabanken Observation Search API V1.
// Response structure confirmed via live API (2026-06-04).
interface RawObservation {
  event?: {
    startDate?: string;
    endDate?: string;
  };
  datasetName?: string;
  identification?: {
    verified?: boolean;
    uncertainIdentification?: boolean;
  };
}

interface ArtDatabankenSearchResponse {
  totalCount?: number;
  records?: RawObservation[];
}

interface WeightedObservation {
  dayOfYear: number;
  year: number;
  weight: number;
}

const TTL_MS = 24 * 60 * 60 * 1000;
const STALE_IF_ERROR_MS = 7 * 24 * 60 * 60 * 1000;

// Module-level singleton so the in-memory cache is shared across all requests
// in a single server process. Tests override via ReadinessServiceDeps.seasonalRepo.
export let defaultSeasonalObservationRepository: SeasonalObservationRepository;

export class SeasonalObservationRepository {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly apiKey: string | undefined,
    private readonly policy: SeasonalObservationPolicy = SEASONAL_OBSERVATION_POLICY,
    private readonly fetchFn: typeof fetch = globalThis.fetch,
  ) {}

  async getSeasonalEvidence(
    params: SeasonalObservationParams,
  ): Promise<SeasonalObservationResult> {
    const now = params.now ?? new Date();

    if (!this.apiKey) {
      return missingResult(['seasonal-evidence-unavailable']);
    }

    const cacheKey = buildCacheKey(params);
    const cached = this.cache.get(cacheKey);

    if (cached && now.getTime() - cached.cachedAt < TTL_MS) {
      return cached.result;
    }

    try {
      const result = await this.fetchSeasonalEvidence(params, now);
      this.cache.set(cacheKey, { result, cachedAt: now.getTime() });
      return result;
    } catch {
      if (cached && now.getTime() - cached.cachedAt < STALE_IF_ERROR_MS) {
        return {
          ...cached.result,
          limitations: [...cached.result.limitations, 'seasonal-evidence-stale-cache'],
        };
      }
      return missingResult(['seasonal-evidence-unavailable']);
    }
  }

  private async fetchSeasonalEvidence(
    params: SeasonalObservationParams,
    now: Date,
  ): Promise<SeasonalObservationResult> {
    const { radiusStepsMeters, baseLookbackYears, expandedLookbackYears, primaryRadiusMeters } =
      this.policy.search;

    let lastWeighted: WeightedObservation[] = [];

    for (const radius of radiusStepsMeters) {
      const raw = await this.searchObservations(params, radius, baseLookbackYears, now);
      const filtered = this.filterObservations(raw);
      const weighted = this.weightObservations(filtered);
      lastWeighted = weighted;

      const quality = this.assessQuality(weighted, now);
      if (quality === 'sufficient') {
        const limitations: string[] = [];
        if (radius > primaryRadiusMeters) {
          limitations.push('seasonal-evidence-expanded-radius');
        }
        return this.buildResult(weighted, radius, baseLookbackYears, quality, now, limitations);
      }
    }

    // All base-lookback radii exhausted; try expanded lookback at max radius.
    const maxRadius = radiusStepsMeters[radiusStepsMeters.length - 1];
    const raw = await this.searchObservations(params, maxRadius, expandedLookbackYears, now);
    const filtered = this.filterObservations(raw);
    const weighted = this.weightObservations(filtered);

    const quality = this.assessQuality(weighted, now);
    const limitations: string[] = ['seasonal-evidence-expanded-radius'];
    if (weighted.length > lastWeighted.length) {
      limitations.push('seasonal-evidence-expanded-lookback');
    }
    return this.buildResult(weighted, maxRadius, expandedLookbackYears, quality, now, limitations);
  }

  private async searchObservations(
    params: SeasonalObservationParams,
    radiusMeters: number,
    lookbackYears: number,
    now: Date,
  ): Promise<RawObservation[]> {
    const startYear = now.getFullYear() - lookbackYears;
    const endYear = now.getFullYear();

    const body = {
      taxon: {
        ids: [params.taxonId],
      },
      includeUnderlyingTaxa: true,
      geographics: {
        geometries: [
          {
            type: 'point',
            coordinates: [params.longitude, params.latitude],
          },
        ],
        maxDistanceFromPoint: radiusMeters,
      },
      date: {
        startDate: `${startYear}-01-01`,
        endDate: `${endYear}-12-31`,
      },
      positiveObservations: true,
      output: {
        fields: [
          'event.startDate',
          'datasetName',
          'identification.verified',
          'identification.uncertainIdentification',
        ],
        // Descending so the 1000-record page always contains the most recent
        // observations, which are most relevant for recent-year sufficiency checks.
        sortOrder: [{ sortBy: 'StartDate', sortType: 'Desc' }],
      },
      pagination: {
        skip: 0,
        take: 1000,
      },
    };

    const response = await this.fetchFn(this.policy.source.observationSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [this.policy.source.authHeaderName]: this.apiKey!,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`ArtDatabanken API error: HTTP ${response.status}`);
    }

    const data = (await response.json()) as ArtDatabankenSearchResponse;
    return data.records ?? [];
  }

  private filterObservations(observations: RawObservation[]): RawObservation[] {
    return observations.filter((obs) => {
      const dataset = resolveDataset(obs);
      return (
        dataset !== null &&
        (this.policy.quality.datasetAllowlist as readonly string[]).includes(dataset)
      );
    });
  }

  private weightObservations(observations: RawObservation[]): WeightedObservation[] {
    const result: WeightedObservation[] = [];
    for (const obs of observations) {
      const dateStr = obs.event?.startDate;
      if (!dateStr) continue;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;

      const dataset = resolveDataset(obs);
      if (!dataset) continue;

      const datasetWeight =
        this.policy.quality.datasetWeights[dataset as SeasonalObservationDataset] ?? 0;
      const verificationWeight = resolveVerificationWeight(
        obs,
        this.policy.quality.verificationWeights,
      );
      const weight = datasetWeight * verificationWeight;
      if (weight <= 0) continue;

      result.push({
        dayOfYear: getDayOfYear(date),
        year: date.getFullYear(),
        weight,
      });
    }
    return result;
  }

  private assessQuality(observations: WeightedObservation[], now: Date): SeasonalEvidenceQuality {
    if (observations.length === 0) return 'missing';

    const totalWeight = observations.reduce((sum, o) => sum + o.weight, 0);
    const distinctYears = new Set(observations.map((o) => o.year)).size;
    const recentCutoffYear = now.getFullYear() - this.policy.sufficiency.recentLookbackYears;
    const recentDistinctYears = new Set(
      observations.filter((o) => o.year >= recentCutoffYear).map((o) => o.year),
    ).size;

    const {
      minimumWeightedObservationCount,
      minimumDistinctObservationYears,
      minimumRecentObservationYears,
    } = this.policy.sufficiency;

    if (
      totalWeight >= minimumWeightedObservationCount &&
      distinctYears >= minimumDistinctObservationYears &&
      recentDistinctYears >= minimumRecentObservationYears
    ) {
      return 'sufficient';
    }

    return 'sparse';
  }

  private buildResult(
    observations: WeightedObservation[],
    radiusUsedMeters: number,
    lookbackYearsUsed: number,
    quality: SeasonalEvidenceQuality,
    now: Date,
    additionalLimitations: string[],
  ): SeasonalObservationResult {
    const totalWeight =
      observations.length > 0
        ? observations.reduce((sum, o) => sum + o.weight, 0)
        : null;
    const distinctYears =
      observations.length > 0 ? new Set(observations.map((o) => o.year)).size : null;

    const score =
      quality === 'sufficient' && observations.length > 0
        ? computeCircularKernelScore(
            observations,
            getDayOfYear(now),
            this.policy.scoring.kernelWindowDays,
          )
        : null;

    const limitations = [...additionalLimitations];
    if (quality === 'sparse') limitations.push('seasonal-evidence-sparse');
    if (quality === 'missing') limitations.push('seasonal-evidence-unavailable');

    return {
      seasonalityScore: score,
      evidenceQuality: quality,
      radiusUsedMeters,
      lookbackYearsUsed,
      rawObservationCount: observations.length,
      weightedObservationCount: totalWeight,
      distinctObservationYears: distinctYears,
      limitations,
    };
  }
}

// --- Pure helpers ---

function missingResult(limitations: string[]): SeasonalObservationResult {
  return {
    seasonalityScore: null,
    evidenceQuality: 'missing',
    radiusUsedMeters: null,
    lookbackYearsUsed: null,
    rawObservationCount: null,
    weightedObservationCount: null,
    distinctObservationYears: null,
    limitations,
  };
}

function buildCacheKey(params: SeasonalObservationParams): string {
  return `${params.taxonId}:${params.latitude.toFixed(2)}:${params.longitude.toFixed(2)}`;
}

function resolveDataset(obs: RawObservation): SeasonalObservationDataset | null {
  const raw = obs.datasetName ?? null;
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('artportalen')) return 'Artportalen';
  if (lower.includes('inaturalist')) return 'iNaturalist';
  return null;
}

function resolveVerificationWeight(
  obs: RawObservation,
  weights: { verifiedCertain: number; unverifiedCertain: number; uncertain: number },
): number {
  const isVerified = obs.identification?.verified ?? false;
  const isUncertain = obs.identification?.uncertainIdentification ?? false;

  if (isUncertain) {
    return weights.uncertain;
  }
  if (isVerified) {
    return weights.verifiedCertain;
  }
  return weights.unverifiedCertain;
}

/**
 * Returns the day-of-year (1–365) for the given date.
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function circularDistance(a: number, b: number, period = 365): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, period - diff);
}

/**
 * Circular triangular-kernel density estimate normalized to 0–100.
 * Each observation contributes linearly within ±windowDays of its day-of-year.
 * The score at todayDayOfYear is divided by the peak density and scaled to 100.
 */
export function computeCircularKernelScore(
  observations: WeightedObservation[],
  todayDayOfYear: number,
  windowDays: number,
): number {
  if (observations.length === 0) return 0;

  let maxDensity = 0;
  let todayDensity = 0;

  for (let d = 1; d <= 365; d++) {
    let density = 0;
    for (const obs of observations) {
      const dist = circularDistance(d, obs.dayOfYear);
      if (dist < windowDays) {
        density += obs.weight * (1 - dist / windowDays);
      }
    }
    if (density > maxDensity) maxDensity = density;
    if (d === todayDayOfYear) todayDensity = density;
  }

  if (maxDensity === 0) return 0;
  return Math.round((todayDensity / maxDensity) * 100);
}

// Initialise the singleton after the class is defined.
defaultSeasonalObservationRepository = new SeasonalObservationRepository(
  process.env.ARTDATABANKEN_API_KEY,
);
