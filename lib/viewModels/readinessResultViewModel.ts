import {
  ReadinessResult,
  ReadinessLabel,
  SeasonalState,
  WeatherEvidence,
} from '../services/mushroomReadinessService';
import { CURATED_SPECIES, SpeciesId } from '../data/mushroomSpecies';

export interface ReadinessResultViewModel {
  /** Main card */
  readinessLabel: string;
  readinessScore: string;
  confidenceDisplay: string;
  confidenceHelper: string;
  speciesDisplay: string;
  speciesLatin: string;
  spotDisplay: string;
  checkedAt: string;
  seasonalTimingLabel: string;
  seasonalTimingColor: string;
  /** Limitation banner (null when no limitations) */
  limitationBanner: LimitationBanner | null;
  /** Disclaimer — always shown */
  disclaimer: string;
  /** Readiness label color class */
  readinessLabelStyle: { bg: string; text: string };
  /** Whether the result is unknown/degraded */
  isUnknown: boolean;
  /** Details sections */
  weatherSignals: WeatherSignalsSection;
  seasonalEvidence: SeasonalEvidenceSection;
  speciesFit: SpeciesFitSection;
}

export interface LimitationBanner {
  title: string;
  body: string;
  bullets: string[];
}

export interface WeatherSignalsSection {
  recentRain: string;
  moistureHistory: string;
  temperature: string;
  weatherHistory: string;
}

export interface SeasonalEvidenceSection {
  sourceCopy: string;
}

export interface SpeciesFitSection {
  summary: string;
  typicalSeason: string;
  temperatureRange: string;
  rainSignal: string;
}

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

const READINESS_LABEL_MAP: Record<ReadinessLabel, string> = {
  'very-likely-worth-checking': 'Strong signal to check',
  'worth-checking': 'Worth checking',
  'possible-but-uncertain': 'Maybe worth checking',
  'unlikely-now': 'Probably wait',
  'very-unlikely-right-now': 'Wait for better conditions',
  'unknown': "Can't assess right now",
};

const READINESS_LABEL_STYLE: Record<ReadinessLabel, { bg: string; text: string }> = {
  'very-likely-worth-checking': { bg: 'bg-emerald-700', text: 'text-white' },
  'worth-checking': { bg: 'bg-emerald-500', text: 'text-white' },
  'possible-but-uncertain': { bg: 'bg-amber-400', text: 'text-amber-900' },
  'unlikely-now': { bg: 'bg-orange-400', text: 'text-white' },
  'very-unlikely-right-now': { bg: 'bg-red-500', text: 'text-white' },
  'unknown': { bg: 'bg-stone-400', text: 'text-white' },
};

const SEASONAL_TIMING_MAP: Record<SeasonalState, { label: string; color: string }> = {
  'in-season': { label: 'In season', color: 'text-emerald-700' },
  'shoulder-season': { label: 'Shoulder season', color: 'text-amber-600' },
  'out-of-season': { label: 'Out of season', color: 'text-red-600' },
  'unknown': { label: 'Unknown', color: 'text-stone-500' },
};

const LIMITATION_COPY: Record<string, string> = {
  'seasonal-evidence-expanded-radius':
    'The app widened the search area because nearby observations were limited.',
  'seasonal-evidence-expanded-lookback':
    'The app looked further back in time because recent observations were limited.',
  'seasonal-evidence-stale-cache':
    'Using recently cached seasonal evidence because fresh observation data was unavailable.',
  'seasonal-evidence-unavailable':
    'Observation data was unavailable, so seasonal timing is less certain.',
  'seasonal-evidence-sparse':
    'Local observations are limited, so the app used the species calendar.',
  'temperature-data-unavailable':
    'Temperature data was unavailable, so confidence is lower.',
  'limited-rainfall-history':
    'Rainfall history is limited, so confidence is lower.',
  'weather-data-unavailable':
    'Weather data was unavailable, so readiness could not be assessed.',
};

const DISCLAIMER =
  'This is a readiness signal based on weather and season patterns. It does not guarantee mushrooms are present, and it is not identification or safety advice.';

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatScore(pct: number | null): string {
  if (pct === null) return '—';
  return `${pct}/100`;
}

function confidenceLabel(pct: number): 'High' | 'Medium' | 'Low' {
  if (pct >= 70) return 'High';
  if (pct >= 40) return 'Medium';
  return 'Low';
}

function formatConfidence(pct: number): string {
  return `${confidenceLabel(pct)} · ${pct}/100`;
}

function confidenceHelper(pct: number): string {
  const label = confidenceLabel(pct);
  if (label === 'High') return 'The main weather and season signals are available.';
  if (label === 'Medium') return 'Some signals are weaker, older, or less local than ideal.';
  return 'Important evidence is missing or uncertain.';
}

function formatCheckedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-SE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

function formatMonths(months: number[]): string {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (months.length === 0) return '—';
  return months.map((m) => names[m - 1]).join('–');
}

// ---------------------------------------------------------------------------
// Weather signals section
// ---------------------------------------------------------------------------

function buildWeatherSignals(
  weatherEvidence: WeatherEvidence | null,
  speciesId: SpeciesId,
): WeatherSignalsSection {
  if (weatherEvidence === null) {
    return {
      recentRain: 'Weather data was unavailable, so readiness could not be assessed.',
      moistureHistory: '—',
      temperature: '—',
      weatherHistory: '—',
    };
  }

  const species = CURATED_SPECIES[speciesId];

  const recentRain =
    weatherEvidence.rain7DayMm >= species.optimalRain7DayMm
      ? `Recent rain supports this result. (${weatherEvidence.rain7DayMm.toFixed(0)} mm over 7 days)`
      : weatherEvidence.rain7DayMm >= species.minRain7DayMm
        ? `Rain has been moderate recently. (${weatherEvidence.rain7DayMm.toFixed(0)} mm over 7 days)`
        : `Rain has been limited recently. (${weatherEvidence.rain7DayMm.toFixed(0)} mm over 7 days)`;

  const moistureHistory =
    weatherEvidence.rain14DayMm >= species.minRain14DayMm
      ? `${weatherEvidence.rain14DayMm.toFixed(0)} mm over 14 days`
      : `${weatherEvidence.rain14DayMm.toFixed(0)} mm over 14 days — below the expected threshold for this species.`;

  const temperature =
    weatherEvidence.averageTemperature7DayC === null
      ? 'Temperature data was unavailable, so confidence is lower.'
      : weatherEvidence.averageTemperature7DayC >= species.optimalMinTempC &&
          weatherEvidence.averageTemperature7DayC <= species.optimalMaxTempC
        ? `Temperatures are within the expected range for this species. (${weatherEvidence.averageTemperature7DayC.toFixed(1)}°C average over 7 days)`
        : weatherEvidence.averageTemperature7DayC >= species.minTempC &&
            weatherEvidence.averageTemperature7DayC <= species.maxTempC
          ? `Temperatures are acceptable but not ideal. (${weatherEvidence.averageTemperature7DayC.toFixed(1)}°C average over 7 days)`
          : `Temperatures are outside the suitable range for this species. (${weatherEvidence.averageTemperature7DayC.toFixed(1)}°C average over 7 days)`;

  const weatherHistory =
    weatherEvidence.rainHistoryDays >= 30
      ? `Weather history was available for this check. (${weatherEvidence.rainHistoryDays} rainfall measurements available)`
      : `Rainfall history is limited. (${weatherEvidence.rainHistoryDays} rainfall measurements available)`;

  return { recentRain, moistureHistory, temperature, weatherHistory };
}

// ---------------------------------------------------------------------------
// Seasonal evidence section
// ---------------------------------------------------------------------------

function buildSeasonalEvidence(result: ReadinessResult): SeasonalEvidenceSection {
  const ev = result.explanation.seasonalEvidence;
  const limitations = result.limitations;

  if (ev.source === 'observation-backed') {
    if (limitations.includes('seasonal-evidence-stale-cache')) {
      return { sourceCopy: LIMITATION_COPY['seasonal-evidence-stale-cache'] };
    }
    return { sourceCopy: 'Based on local observation patterns for this species.' };
  }

  // species-calendar source
  if (ev.quality === 'missing') {
    return { sourceCopy: 'No useful local observations were found, so the app used the species calendar.' };
  }
  return { sourceCopy: 'Local observations are limited, so the app used the species calendar.' };
}

// ---------------------------------------------------------------------------
// Species fit section
// ---------------------------------------------------------------------------

function buildSpeciesFit(speciesId: SpeciesId): SpeciesFitSection {
  const species = CURATED_SPECIES[speciesId];
  const allMonths = [...new Set([...species.seasonMonths, ...species.peakMonths])].sort(
    (a, b) => a - b,
  );
  return {
    summary: `${species.displayName} usually responds to recent rain, suitable temperatures, and the right seasonal timing. This result compares today's signals with that species profile.`,
    typicalSeason: `Typical season: ${formatMonths(allMonths)}`,
    temperatureRange: `Best temperature range: ${species.optimalMinTempC}–${species.optimalMaxTempC}°C`,
    rainSignal: `Rain signal: ${species.minRain7DayMm} mm+ over 7 days`,
  };
}

// ---------------------------------------------------------------------------
// Limitation banner
// ---------------------------------------------------------------------------

function buildLimitationBanner(limitations: string[]): LimitationBanner | null {
  if (limitations.length === 0) return null;
  const bullets = limitations
    .map((code) => LIMITATION_COPY[code] ?? null)
    .filter((copy): copy is string => copy !== null);
  return {
    title: 'Result limitation',
    body: 'Some evidence was missing or less local than ideal, so treat this result as less certain.',
    bullets,
  };
}

// ---------------------------------------------------------------------------
// Main mapper
// ---------------------------------------------------------------------------

export function toReadinessResultViewModel(result: ReadinessResult): ReadinessResultViewModel {
  const label = result.result.readinessLabel;
  const seasonalState = result.result.seasonalState;

  return {
    readinessLabel: READINESS_LABEL_MAP[label],
    readinessScore: formatScore(result.result.probabilityPercent),
    confidenceDisplay: formatConfidence(result.result.confidencePercent),
    confidenceHelper: confidenceHelper(result.result.confidencePercent),
    speciesDisplay: result.species.displayName,
    speciesLatin: result.species.latinName,
    spotDisplay: formatCoordinates(result.spot.latitude, result.spot.longitude),
    checkedAt: formatCheckedAt(result.checkedAt),
    seasonalTimingLabel: SEASONAL_TIMING_MAP[seasonalState].label,
    seasonalTimingColor: SEASONAL_TIMING_MAP[seasonalState].color,
    limitationBanner: buildLimitationBanner(result.limitations),
    disclaimer: DISCLAIMER,
    readinessLabelStyle: READINESS_LABEL_STYLE[label],
    isUnknown: label === 'unknown',
    weatherSignals: buildWeatherSignals(result.weatherEvidence, result.species.id),
    seasonalEvidence: buildSeasonalEvidence(result),
    speciesFit: buildSpeciesFit(result.species.id),
  };
}
