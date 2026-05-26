import { getHistoricalWeatherData } from './weatherHistoryService';
import {
  CURATED_SPECIES,
  MushroomSpeciesProfile,
  SpeciesId,
} from '../data/mushroomSpecies';
import { logDebug, logInfo, summarizeMeasurements } from '../utils/observability';

export type ReadinessLabel =
  | 'very-likely-worth-checking'
  | 'worth-checking'
  | 'possible-but-uncertain'
  | 'unlikely-now'
  | 'very-unlikely-right-now'
  | 'unknown';

export type SeasonalState = 'in-season' | 'shoulder-season' | 'out-of-season' | 'unknown';
export type SupportLevel = 'supported' | 'partial' | 'missing';

export interface ReadinessResult {
  spot: { latitude: number; longitude: number };
  species: { id: SpeciesId; displayName: string; latinName: string };
  result: {
    readinessLabel: ReadinessLabel;
    probabilityPercent: number | null;
    confidencePercent: number;
    seasonalState: SeasonalState;
  };
  explanation: {
    summary: string;
    weatherSupport: SupportLevel;
    seasonalSupport: SupportLevel;
    speciesTimingSupport: SupportLevel;
  };
  limitations: string[];
}

export async function getMushroomReadiness(
  latitude: number,
  longitude: number,
  speciesId: SpeciesId,
): Promise<ReadinessResult> {
  const species = CURATED_SPECIES[speciesId];
  const now = new Date();

  logDebug('[mushroom-readiness] request', {
    latitude,
    longitude,
    speciesId,
    speciesName: species.displayName,
    speciesThresholds: {
      seasonMonths: species.seasonMonths,
      peakMonths: species.peakMonths,
      minTempC: species.minTempC,
      optimalMinTempC: species.optimalMinTempC,
      optimalMaxTempC: species.optimalMaxTempC,
      maxTempC: species.maxTempC,
      minRain7DayMm: species.minRain7DayMm,
      optimalRain7DayMm: species.optimalRain7DayMm,
      minRain14DayMm: species.minRain14DayMm,
    },
    seasonalEvidence: {
      source: 'static-species-calendar',
      observationsFetched: false,
      note: 'No SLU or ArtDatabanken observation fetch is implemented in the current readiness service.',
    },
  });

  const weatherData = await getHistoricalWeatherData(latitude, longitude);

  const rainMeasurements = weatherData.rainStation?.rainFallMeasurements ?? [];
  const tempMeasurements = weatherData.temperatureStation?.temperatureMeasurements ?? [];

  const hasRainData = rainMeasurements.length > 0;
  const hasTempData = tempMeasurements.length > 0;

  logInfo('[mushroom-readiness] fetched evidence', {
    speciesId,
    latitude,
    longitude,
    rainStation: weatherData.rainStation
      ? {
          key: weatherData.rainStation.key,
          name: weatherData.rainStation.name,
          measurements: summarizeMeasurements(rainMeasurements, (measurement) => ({
            date: measurement.date,
            rainFall: measurement.rainFall,
          })),
        }
      : null,
    temperatureStation: weatherData.temperatureStation
      ? {
          key: weatherData.temperatureStation.key,
          name: weatherData.temperatureStation.name,
          measurements: summarizeMeasurements(tempMeasurements, (measurement) => ({
            date: measurement.date,
            temperature: measurement.temperature,
          })),
        }
      : null,
  });

  if (!hasRainData) {
    logInfo('[mushroom-readiness] result', {
      speciesId,
      latitude,
      longitude,
      outcome: 'unknown',
      reason: 'weather-data-unavailable',
    });
    return buildUnknownResult(latitude, longitude, species, ['weather-data-unavailable']);
  }

  const rainWindows = computeRainWindows(rainMeasurements, now);
  const avgTemp = hasTempData ? computeRecentAvgTemp(tempMeasurements, now) : null;

  const seasonalState = getSeasonalState(species, now);
  const tempScore = assessTempScore(species, avgTemp);
  const weatherSupport = assessWeatherSupport(species, rainWindows, avgTemp);
  const seasonalSupport = assessSeasonalSupport(seasonalState);

  const probability = computeProbability(seasonalState, weatherSupport, tempScore);
  const readinessLabel = computeReadinessLabel(probability, seasonalState);
  const confidencePercent = computeConfidence(
    hasRainData,
    hasTempData,
    rainWindows.dayCount,
    seasonalState,
  );

  const limitations: string[] = [];
  if (!hasTempData) limitations.push('temperature-data-unavailable');
  if (rainWindows.dayCount < 14) limitations.push('limited-rainfall-history');

  logInfo('[mushroom-readiness] computed result', {
    speciesId,
    latitude,
    longitude,
    seasonalEvidence: {
      source: 'static-species-calendar',
      observationsFetched: false,
    },
    derivedInputs: {
      rainWindows,
      avgTemp,
      hasRainData,
      hasTempData,
      tempScore,
      seasonalState,
      weatherSupport,
      seasonalSupport,
    },
    result: {
      probability,
      readinessLabel,
      confidencePercent,
      limitations,
    },
  });

  return {
    spot: { latitude, longitude },
    species: {
      id: speciesId,
      displayName: species.displayName,
      latinName: species.latinName,
    },
    result: {
      readinessLabel,
      probabilityPercent: probability,
      confidencePercent,
      seasonalState,
    },
    explanation: {
      summary: buildSummary(readinessLabel, seasonalState, weatherSupport, species),
      weatherSupport,
      seasonalSupport,
      speciesTimingSupport: seasonalSupport,
    },
    limitations,
  };
}

function computeRainWindows(
  measurements: Array<{ date: string; rainFall: number }>,
  now: Date,
) {
  const dated = measurements
    .map((m) => ({ date: new Date(m.date), rainFall: m.rainFall }))
    .filter((m) => m.date <= now)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  function totalForDays(days: number): number {
    const cutoff = new Date(now.getTime() - days * 86_400_000);
    return dated
      .filter((m) => m.date >= cutoff)
      .reduce((sum, m) => sum + m.rainFall, 0);
  }

  return {
    rain3Day: totalForDays(3),
    rain7Day: totalForDays(7),
    rain14Day: totalForDays(14),
    rain30Day: totalForDays(30),
    dayCount: dated.length,
  };
}

function computeRecentAvgTemp(
  measurements: Array<{ date: string; temperature: number }>,
  now: Date,
  days = 7,
): number | null {
  const cutoff = new Date(now.getTime() - days * 86_400_000);
  const recent = measurements
    .map((m) => ({ date: new Date(m.date), temperature: m.temperature }))
    .filter((m) => m.date >= cutoff && m.date <= now);
  if (recent.length === 0) return null;
  return recent.reduce((sum, m) => sum + m.temperature, 0) / recent.length;
}

function getSeasonalState(species: MushroomSpeciesProfile, date: Date): SeasonalState {
  const month = date.getMonth() + 1;
  if (species.peakMonths.includes(month)) return 'in-season';
  if (species.seasonMonths.includes(month)) return 'shoulder-season';
  return 'out-of-season';
}

function assessTempScore(
  species: MushroomSpeciesProfile,
  avgTemp: number | null,
): 'optimal' | 'ok' | 'poor' | 'unknown' {
  if (avgTemp === null) return 'unknown';
  if (avgTemp < species.minTempC || avgTemp > species.maxTempC) return 'poor';
  if (avgTemp >= species.optimalMinTempC && avgTemp <= species.optimalMaxTempC) return 'optimal';
  return 'ok';
}

function assessWeatherSupport(
  species: MushroomSpeciesProfile,
  rain: { rain7Day: number; rain14Day: number },
  avgTemp: number | null,
): SupportLevel {
  const tempOk = avgTemp === null || (avgTemp >= species.minTempC && avgTemp <= species.maxTempC);
  if (!tempOk) return 'missing';

  const hasTrigger = rain.rain7Day >= species.minRain7DayMm;
  const hasOptimalTrigger = rain.rain7Day >= species.optimalRain7DayMm;
  const hasMoisture = rain.rain14Day >= species.minRain14DayMm;
  const hasPartialMoisture = rain.rain14Day >= species.minRain14DayMm * 0.6;

  if (hasOptimalTrigger && hasMoisture) return 'supported';
  if (hasTrigger && hasPartialMoisture) return 'partial';
  if (!hasTrigger && !hasMoisture) return 'missing';
  return 'partial';
}

function assessSeasonalSupport(seasonalState: SeasonalState): SupportLevel {
  if (seasonalState === 'in-season') return 'supported';
  if (seasonalState === 'shoulder-season') return 'partial';
  return 'missing';
}

function computeProbability(
  seasonalState: SeasonalState,
  weatherSupport: SupportLevel,
  tempScore: 'optimal' | 'ok' | 'poor' | 'unknown',
): number {
  const seasonBase: Record<SeasonalState, number> = {
    'in-season': 55,
    'shoulder-season': 28,
    'out-of-season': 5,
    'unknown': 15,
  };
  const weatherDelta: Record<SupportLevel, number> = {
    supported: 25,
    partial: 5,
    missing: -20,
  };
  const tempDelta: Record<string, number> = {
    optimal: 10,
    ok: 0,
    poor: -15,
    unknown: 0,
  };

  const raw =
    seasonBase[seasonalState] + weatherDelta[weatherSupport] + tempDelta[tempScore];
  return Math.max(1, Math.min(99, Math.round(raw)));
}

function computeReadinessLabel(
  probability: number,
  seasonalState: SeasonalState,
): ReadinessLabel {
  if (seasonalState === 'out-of-season') return 'very-unlikely-right-now';
  if (probability >= 75) return 'very-likely-worth-checking';
  if (probability >= 55) return 'worth-checking';
  if (probability >= 35) return 'possible-but-uncertain';
  if (probability >= 15) return 'unlikely-now';
  return 'very-unlikely-right-now';
}

function computeConfidence(
  hasRainData: boolean,
  hasTempData: boolean,
  rainDayCount: number,
  seasonalState: SeasonalState,
): number {
  let score = 20;
  if (hasRainData) score += 20;
  if (hasTempData) score += 10;
  score += Math.min(rainDayCount / 30, 1) * 25;
  if (seasonalState === 'in-season' || seasonalState === 'out-of-season') score += 15;
  else if (seasonalState === 'shoulder-season') score += 5;
  return Math.max(5, Math.min(95, Math.round(score)));
}

function buildSummary(
  label: ReadinessLabel,
  seasonalState: SeasonalState,
  weatherSupport: SupportLevel,
  species: MushroomSpeciesProfile,
): string {
  const name = species.displayName;
  if (label === 'unknown') {
    return 'Insufficient data to assess readiness for this spot.';
  }
  if (seasonalState === 'out-of-season') {
    return `${name} is not in season right now. Conditions do not support fruiting.`;
  }
  if (seasonalState === 'in-season' && weatherSupport === 'supported') {
    return `${name} is in peak season and recent weather supports fruiting. Worth checking your spot.`;
  }
  if (seasonalState === 'in-season' && weatherSupport === 'partial') {
    return `${name} is in season but weather conditions only partially support fruiting. Conditions are mixed.`;
  }
  if (seasonalState === 'in-season' && weatherSupport === 'missing') {
    return `${name} is in season, but recent rainfall has been insufficient to trigger fruiting.`;
  }
  if (seasonalState === 'shoulder-season' && weatherSupport === 'supported') {
    return `${name} is in shoulder season and weather is favorable. Fruiting is possible but not guaranteed.`;
  }
  if (seasonalState === 'shoulder-season') {
    return `${name} is in shoulder season and conditions are mixed. Fruiting is uncertain.`;
  }
  return `Readiness for ${name} is uncertain based on available data.`;
}

function buildUnknownResult(
  latitude: number,
  longitude: number,
  species: MushroomSpeciesProfile,
  limitations: string[],
): ReadinessResult {
  return {
    spot: { latitude, longitude },
    species: {
      id: species.id,
      displayName: species.displayName,
      latinName: species.latinName,
    },
    result: {
      readinessLabel: 'unknown',
      probabilityPercent: null,
      confidencePercent: 10,
      seasonalState: 'unknown',
    },
    explanation: {
      summary: 'Insufficient data to assess readiness for this spot.',
      weatherSupport: 'missing',
      seasonalSupport: 'missing',
      speciesTimingSupport: 'missing',
    },
    limitations,
  };
}
