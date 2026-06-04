export type SeasonalObservationDataset = 'Artportalen' | 'iNaturalist';
export type SeasonalEvidenceQuality = 'sufficient' | 'sparse' | 'missing';

export interface SeasonalObservationPolicy {
	source: {
		observationSearchUrl: string;
		taxonSearchUrl: string;
		authHeaderName: string;
	};
	search: {
		primaryRadiusMeters: number;
		radiusStepsMeters: number[];
		maxRadiusMeters: number;
		baseLookbackYears: number;
		expandedLookbackYears: number;
		fallbackOrder: Array<'radius' | 'lookback'>;
	};
	sufficiency: {
		qualityLevels: SeasonalEvidenceQuality[];
		minimumWeightedObservationCount: number;
		minimumDistinctObservationYears: number;
		minimumRecentObservationYears: number;
		recentLookbackYears: number;
	};
	quality: {
		datasetAllowlist: SeasonalObservationDataset[];
		defaultTrustedDataset: SeasonalObservationDataset;
		datasetWeights: Record<SeasonalObservationDataset, number>;
		verificationWeights: {
			verifiedCertain: number;
			unverifiedCertain: number;
			uncertain: number;
		};
	};
	scoring: {
		model: 'circular-kernel-density';
		kernelWindowDays: number;
		scoreRange: {
			min: number;
			max: number;
		};
		seasonalStateThresholds: {
			inSeasonMin: number;
			shoulderSeasonMin: number;
		};
	};
	degradedBehavior: {
		limitationCodes: string[];
	};
}

export const SEASONAL_OBSERVATION_POLICY = {
	source: {
		observationSearchUrl: 'https://api.artdatabanken.se/species-observation-system/v1/Observations/Search',
		taxonSearchUrl: 'https://api.artdatabanken.se/taxonservice/v1/taxa/search',
		authHeaderName: 'Ocp-Apim-Subscription-Key',
	},
	search: {
		primaryRadiusMeters: 3000,
		radiusStepsMeters: [3000, 5000, 10000, 15000],
		maxRadiusMeters: 15000,
		baseLookbackYears: 10,
		expandedLookbackYears: 15,
		fallbackOrder: ['radius', 'lookback'],
	},
	sufficiency: {
		qualityLevels: ['sufficient', 'sparse', 'missing'],
		minimumWeightedObservationCount: 4,
		minimumDistinctObservationYears: 3,
		minimumRecentObservationYears: 2,
		recentLookbackYears: 10,
	},
	quality: {
		datasetAllowlist: ['Artportalen', 'iNaturalist'],
		defaultTrustedDataset: 'Artportalen',
		datasetWeights: {
			Artportalen: 1,
			iNaturalist: 0.9,
		},
		verificationWeights: {
			verifiedCertain: 1,
			unverifiedCertain: 0.6,
			uncertain: 0.2,
		},
	},
	scoring: {
		model: 'circular-kernel-density',
		kernelWindowDays: 30,
		scoreRange: {
			min: 0,
			max: 100,
		},
		seasonalStateThresholds: {
			inSeasonMin: 65,
			shoulderSeasonMin: 35,
		},
	},
	degradedBehavior: {
		limitationCodes: [
			'seasonal-evidence-unavailable',
			'seasonal-evidence-sparse',
			'seasonal-evidence-expanded-radius',
			'seasonal-evidence-expanded-lookback',
			'seasonal-evidence-stale-cache',
		],
	},
} satisfies SeasonalObservationPolicy;
