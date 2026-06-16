import {
  toReadinessResultViewModel,
} from '@/lib/viewModels/readinessResultViewModel';
import { ReadinessResult } from '@/lib/services/mushroomReadinessService';

const FIXED_NOW_ISO = '2026-09-15T12:00:00.000Z';

function makeResult(overrides: Partial<ReadinessResult> = {}): ReadinessResult {
  return {
    checkedAt: FIXED_NOW_ISO,
    spot: { latitude: 57.1134, longitude: 12.7732 },
    species: { id: 'boletus-edulis', displayName: 'Porcini', latinName: 'Boletus edulis' },
    result: {
      readinessLabel: 'worth-checking',
      probabilityPercent: 72,
      confidencePercent: 65,
      seasonalState: 'in-season',
    },
    explanation: {
      summary: 'Porcini is in peak season and recent weather supports fruiting.',
      weatherSupport: 'supported',
      seasonalSupport: 'supported',
      seasonalEvidence: {
        quality: 'sufficient',
        source: 'observation-backed',
        radiusUsedMeters: 3000,
        lookbackYearsUsed: 10,
        rawObservationCount: 12,
        weightedObservationCount: 12,
        distinctObservationYears: 5,
      },
    },
    weatherEvidence: {
      rain3DayMm: 8,
      rain7DayMm: 25,
      rain14DayMm: 38,
      rain30DayMm: 52,
      rainHistoryDays: 30,
      averageTemperature7DayC: 18,
      rainStationName: 'Ullared Station',
      temperatureStationName: 'Göteborg Station',
    },
    limitations: [],
    ...overrides,
  };
}

describe('toReadinessResultViewModel', () => {
  describe('readiness label translation', () => {
    it('maps very-likely-worth-checking to Strong signal to check', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'very-likely-worth-checking', probabilityPercent: 80, confidencePercent: 75, seasonalState: 'in-season' } }),
      );
      expect(vm.readinessLabel).toBe('Strong signal to check');
    });

    it('maps worth-checking to Worth checking', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.readinessLabel).toBe('Worth checking');
    });

    it('maps possible-but-uncertain to Maybe worth checking', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'possible-but-uncertain', probabilityPercent: 40, confidencePercent: 50, seasonalState: 'shoulder-season' } }),
      );
      expect(vm.readinessLabel).toBe('Maybe worth checking');
    });

    it('maps unlikely-now to Probably wait', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'unlikely-now', probabilityPercent: 20, confidencePercent: 50, seasonalState: 'shoulder-season' } }),
      );
      expect(vm.readinessLabel).toBe('Probably wait');
    });

    it('maps very-unlikely-right-now to Wait for better conditions', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'very-unlikely-right-now', probabilityPercent: 5, confidencePercent: 60, seasonalState: 'out-of-season' } }),
      );
      expect(vm.readinessLabel).toBe('Wait for better conditions');
    });

    it("maps unknown to Can't assess right now", () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'unknown', probabilityPercent: null, confidencePercent: 10, seasonalState: 'unknown' } }),
      );
      expect(vm.readinessLabel).toBe("Can't assess right now");
    });
  });

  describe('readiness score formatting', () => {
    it('formats probabilityPercent as N/100', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.readinessScore).toBe('72/100');
    });

    it('formats null probabilityPercent as —', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'unknown', probabilityPercent: null, confidencePercent: 10, seasonalState: 'unknown' } }),
      );
      expect(vm.readinessScore).toBe('—');
    });

    it('does not include a percent sign in the readiness score', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.readinessScore).not.toContain('%');
    });
  });

  describe('confidence formatting', () => {
    it('formats confidencePercent 43 as Medium · 43/100', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'worth-checking', probabilityPercent: 72, confidencePercent: 43, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceDisplay).toBe('Medium · 43/100');
    });

    it('formats confidencePercent 75 as High · 75/100', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'worth-checking', probabilityPercent: 72, confidencePercent: 75, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceDisplay).toBe('High · 75/100');
    });

    it('formats confidencePercent 25 as Low · 25/100', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'worth-checking', probabilityPercent: 72, confidencePercent: 25, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceDisplay).toBe('Low · 25/100');
    });

    it('uses Medium not Moderate for confidence in the 40–69 range', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'worth-checking', probabilityPercent: 72, confidencePercent: 55, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceDisplay).not.toContain('Moderate');
      expect(vm.confidenceDisplay).toContain('Medium');
    });

    it('provides High confidence helper copy when confidence >= 70', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'worth-checking', probabilityPercent: 72, confidencePercent: 70, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceHelper).toBe('The main weather and season signals are available.');
    });

    it('provides Medium confidence helper copy when confidence is 40–69', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'worth-checking', probabilityPercent: 72, confidencePercent: 55, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceHelper).toBe('Some signals are weaker, older, or less local than ideal.');
    });

    it('provides Low confidence helper copy when confidence < 40', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'possible-but-uncertain', probabilityPercent: 40, confidencePercent: 20, seasonalState: 'in-season' } }),
      );
      expect(vm.confidenceHelper).toBe('Important evidence is missing or uncertain.');
    });
  });

  describe('limitation banner', () => {
    it('returns null limitationBanner when no limitations', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: [] }));
      expect(vm.limitationBanner).toBeNull();
    });

    it('returns a banner with translated copy for seasonal-evidence-expanded-radius', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: ['seasonal-evidence-expanded-radius'] }));
      expect(vm.limitationBanner).not.toBeNull();
      expect(vm.limitationBanner!.bullets).toContain(
        'The app widened the search area because nearby observations were limited.',
      );
    });

    it('returns a banner with translated copy for seasonal-evidence-expanded-lookback', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: ['seasonal-evidence-expanded-lookback'] }));
      expect(vm.limitationBanner!.bullets).toContain(
        'The app looked further back in time because recent observations were limited.',
      );
    });

    it('returns a banner with translated copy for seasonal-evidence-stale-cache', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: ['seasonal-evidence-stale-cache'] }));
      expect(vm.limitationBanner!.bullets).toContain(
        'Using recently cached seasonal evidence because fresh observation data was unavailable.',
      );
    });

    it('returns a banner with translated copy for temperature-data-unavailable', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: ['temperature-data-unavailable'] }));
      expect(vm.limitationBanner!.bullets).toContain(
        'Temperature data was unavailable, so confidence is lower.',
      );
    });

    it('returns a banner with translated copy for weather-data-unavailable', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: ['weather-data-unavailable'] }));
      expect(vm.limitationBanner!.bullets).toContain(
        'Weather data was unavailable, so readiness could not be assessed.',
      );
    });

    it('limitation bullets do not contain raw hyphenated codes', () => {
      const vm = toReadinessResultViewModel(makeResult({ limitations: ['temperature-data-unavailable', 'seasonal-evidence-expanded-radius'] }));
      for (const bullet of vm.limitationBanner!.bullets) {
        expect(bullet).not.toMatch(/^[a-z]+-[a-z]+-[a-z]+/);
      }
    });
  });

  describe('disclaimer', () => {
    it('includes the no-guarantee disclaimer for a normal result', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.disclaimer).toContain('does not guarantee mushrooms are present');
    });

    it('includes the no-identification/safety disclaimer for a normal result', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.disclaimer).toContain('not identification or safety advice');
    });

    it('includes the disclaimer for an unknown result', () => {
      const vm = toReadinessResultViewModel(
        makeResult({
          result: { readinessLabel: 'unknown', probabilityPercent: null, confidencePercent: 10, seasonalState: 'unknown' },
          limitations: ['weather-data-unavailable'],
          weatherEvidence: null,
        }),
      );
      expect(vm.disclaimer).toBeTruthy();
      expect(vm.disclaimer).toContain('does not guarantee mushrooms are present');
    });
  });

  describe('seasonal evidence section', () => {
    it('shows observation-backed copy when source is observation-backed', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.seasonalEvidence.sourceCopy).toBe('Based on local observation patterns for this species.');
    });

    it('shows species-calendar copy for sparse evidence', () => {
      const vm = toReadinessResultViewModel(
        makeResult({
          explanation: {
            ...makeResult().explanation,
            seasonalEvidence: {
              quality: 'sparse',
              source: 'species-calendar',
              radiusUsedMeters: 10000,
              lookbackYearsUsed: 10,
              rawObservationCount: 2,
              weightedObservationCount: 2,
              distinctObservationYears: 1,
            },
          },
          limitations: ['seasonal-evidence-sparse'],
        }),
      );
      expect(vm.seasonalEvidence.sourceCopy).toContain('species calendar');
      expect(vm.seasonalEvidence.sourceCopy).not.toContain('KDE');
    });

    it('shows no-observations copy for missing evidence', () => {
      const vm = toReadinessResultViewModel(
        makeResult({
          explanation: {
            ...makeResult().explanation,
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
          limitations: ['seasonal-evidence-unavailable'],
        }),
      );
      expect(vm.seasonalEvidence.sourceCopy).toContain('No useful local observations');
    });

    it('shows stale cache copy when observation-backed but stale', () => {
      const vm = toReadinessResultViewModel(
        makeResult({
          explanation: {
            ...makeResult().explanation,
            seasonalEvidence: {
              quality: 'sufficient',
              source: 'observation-backed',
              radiusUsedMeters: 3000,
              lookbackYearsUsed: 10,
              rawObservationCount: 10,
              weightedObservationCount: 10,
              distinctObservationYears: 4,
            },
          },
          limitations: ['seasonal-evidence-stale-cache'],
        }),
      );
      expect(vm.seasonalEvidence.sourceCopy).toContain('cached');
    });

    it('does not expose raw observation counts in the seasonal evidence section', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(JSON.stringify(vm.seasonalEvidence)).not.toContain('rawObservationCount');
      expect(JSON.stringify(vm.seasonalEvidence)).not.toContain('weightedObservationCount');
      expect(JSON.stringify(vm.seasonalEvidence)).not.toContain('distinctObservationYears');
    });
  });

  describe('isUnknown flag', () => {
    it('is false for a normal result', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.isUnknown).toBe(false);
    });

    it('is true for an unknown result', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ result: { readinessLabel: 'unknown', probabilityPercent: null, confidencePercent: 10, seasonalState: 'unknown' } }),
      );
      expect(vm.isUnknown).toBe(true);
    });
  });

  describe('species fit section', () => {
    it('includes the species display name in the summary', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.speciesFit.summary).toContain('Porcini');
    });

    it('includes typical season months', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.speciesFit.typicalSeason).toContain('Typical season');
    });

    it('includes temperature range', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.speciesFit.temperatureRange).toContain('°C');
    });

    it('includes rain signal', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.speciesFit.rainSignal).toContain('mm');
    });
  });

  describe('weather signals section', () => {
    it('shows unavailable copy when weatherEvidence is null', () => {
      const vm = toReadinessResultViewModel(
        makeResult({
          weatherEvidence: null,
          limitations: ['weather-data-unavailable'],
        }),
      );
      expect(vm.weatherSignals.recentRain).toContain('unavailable');
    });

    it('shows rain value in recent rain copy', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.weatherSignals.recentRain).toContain('mm');
    });

    it('shows temperature value when available', () => {
      const vm = toReadinessResultViewModel(makeResult());
      expect(vm.weatherSignals.temperature).toContain('°C');
    });

    it('shows temperature unavailable copy when averageTemperature7DayC is null', () => {
      const vm = toReadinessResultViewModel(
        makeResult({
          weatherEvidence: {
            ...makeResult().weatherEvidence!,
            averageTemperature7DayC: null,
          },
          limitations: ['temperature-data-unavailable'],
        }),
      );
      expect(vm.weatherSignals.temperature).toContain('unavailable');
    });

    it('weatherHistory uses "rainfall measurements available" wording for full history', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ weatherEvidence: { ...makeResult().weatherEvidence!, rainHistoryDays: 30 } }),
      );
      expect(vm.weatherSignals.weatherHistory).toContain('rainfall measurements available');
      expect(vm.weatherSignals.weatherHistory).not.toContain('days of rainfall data');
      expect(vm.weatherSignals.weatherHistory).not.toContain('days available');
    });

    it('weatherHistory uses "rainfall measurements available" wording for limited history', () => {
      const vm = toReadinessResultViewModel(
        makeResult({ weatherEvidence: { ...makeResult().weatherEvidence!, rainHistoryDays: 10 } }),
      );
      expect(vm.weatherSignals.weatherHistory).toContain('rainfall measurements available');
      expect(vm.weatherSignals.weatherHistory).toContain('10');
      expect(vm.weatherSignals.weatherHistory).not.toContain('days of rainfall data');
      expect(vm.weatherSignals.weatherHistory).not.toContain('days available');
    });
  });
});
