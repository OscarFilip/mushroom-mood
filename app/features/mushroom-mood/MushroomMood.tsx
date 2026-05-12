"use client";

import React, { JSX, useState } from 'react';
import { CURATED_SPECIES, SPECIES_ID_LIST, SpeciesId } from '../../../lib/data/mushroomSpecies';
import { ReadinessResult, ReadinessLabel, SupportLevel, SeasonalState } from '../../../lib/services/mushroomReadinessService';

const PRESET_SPOTS = [
  { label: 'Ullared, Sweden', lat: '57.1134', lon: '12.7732' },
  { label: 'Stockholm', lat: '59.3293', lon: '18.0686' },
  { label: 'Gothenburg', lat: '57.7089', lon: '11.9746' },
];

const LABEL_STYLES: Record<ReadinessLabel, { bg: string; text: string; label: string }> = {
  'very-likely-worth-checking': { bg: 'bg-emerald-700', text: 'text-white', label: 'Very likely worth checking' },
  'worth-checking': { bg: 'bg-emerald-500', text: 'text-white', label: 'Worth checking' },
  'possible-but-uncertain': { bg: 'bg-amber-400', text: 'text-amber-900', label: 'Possible but uncertain' },
  'unlikely-now': { bg: 'bg-orange-400', text: 'text-white', label: 'Unlikely now' },
  'very-unlikely-right-now': { bg: 'bg-red-500', text: 'text-white', label: 'Very unlikely right now' },
  'unknown': { bg: 'bg-stone-400', text: 'text-white', label: 'Unknown' },
};

const SEASONAL_STATE_LABELS: Record<SeasonalState, { text: string; color: string }> = {
  'in-season': { text: 'In season', color: 'text-emerald-700' },
  'shoulder-season': { text: 'Shoulder season', color: 'text-amber-600' },
  'out-of-season': { text: 'Out of season', color: 'text-red-600' },
  'unknown': { text: 'Unknown', color: 'text-stone-500' },
};

const SUPPORT_LABELS: Record<SupportLevel, { text: string; color: string }> = {
  'supported': { text: 'Supported', color: 'text-emerald-600' },
  'partial': { text: 'Partial', color: 'text-amber-600' },
  'missing': { text: 'Insufficient', color: 'text-red-600' },
};

function confidenceLabel(pct: number): string {
  if (pct >= 70) return 'High';
  if (pct >= 40) return 'Moderate';
  return 'Low';
}

export default function MushroomMood(): JSX.Element {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [speciesId, setSpeciesId] = useState<SpeciesId>('cantharellus-cibarius');
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = latitude.trim() !== '' && longitude.trim() !== '' && !loading;

  async function checkReadiness(): Promise<void> {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = `/api/mushroom-readiness?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&species=${speciesId}`;
      const response = await fetch(url);
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || `Request failed with status ${response.status}`);
      }

      setResult(body as ReadinessResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(lat: string, lon: string): void {
    setLatitude(lat);
    setLongitude(lon);
    setResult(null);
    setError(null);
  }

  const labelStyle = result ? LABEL_STYLES[result.result.readinessLabel] : null;
  const isInsufficient = result?.result.readinessLabel === 'unknown';

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {/* Spot input */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">Your spot</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_SPOTS.map((spot) => (
            <button
              key={spot.label}
              onClick={() => applyPreset(spot.lat, spot.lon)}
              className="px-3 py-1 text-sm bg-stone-200 hover:bg-stone-300 rounded transition"
            >
              {spot.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </section>

      {/* Species selector */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">Species</h2>
        <div className="flex flex-wrap gap-2">
          {SPECIES_ID_LIST.map((id) => {
            const sp = CURATED_SPECIES[id];
            const selected = id === speciesId;
            return (
              <button
                key={id}
                onClick={() => setSpeciesId(id)}
                className={`px-4 py-2 rounded border transition text-sm ${
                  selected
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-400'
                }`}
              >
                <span className="font-medium">{sp.displayName}</span>
                <span className="block text-xs italic opacity-75">{sp.latinName}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Submit */}
      <button
        onClick={checkReadiness}
        disabled={!canSubmit}
        className={`w-full py-3 rounded font-semibold text-white transition mb-8 ${
          canSubmit
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-emerald-300 cursor-not-allowed'
        }`}
      >
        {loading ? 'Checking…' : 'Check readiness'}
      </button>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <section>
          {/* Readiness label */}
          <div className={`rounded-lg p-5 mb-4 ${labelStyle?.bg}`}>
            <p className={`text-xs uppercase tracking-wide font-semibold mb-1 opacity-80 ${labelStyle?.text}`}>
              Readiness
            </p>
            <p className={`text-2xl font-bold ${labelStyle?.text}`}>
              {labelStyle?.label}
            </p>
            <p className={`text-sm mt-1 opacity-80 ${labelStyle?.text}`}>
              {result.species.displayName} · {result.species.latinName}
            </p>
          </div>

          {isInsufficient ? (
            <div className="p-4 bg-stone-100 rounded border border-stone-200 text-stone-600 text-sm">
              <p className="font-semibold mb-1">Insufficient data</p>
              <p>{result.explanation.summary}</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <p className="text-stone-700 mb-4 text-sm leading-relaxed">
                {result.explanation.summary}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white border border-stone-200 rounded p-3 text-center">
                  <p className="text-xs text-stone-500 mb-1">Probability</p>
                  <p className="text-2xl font-bold text-stone-800">
                    {result.result.probabilityPercent ?? '—'}
                    {result.result.probabilityPercent !== null && (
                      <span className="text-base font-normal">%</span>
                    )}
                  </p>
                </div>
                <div className="bg-white border border-stone-200 rounded p-3 text-center">
                  <p className="text-xs text-stone-500 mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-stone-800">
                    {result.result.confidencePercent}
                    <span className="text-base font-normal">%</span>
                  </p>
                  <p className="text-xs text-stone-400">
                    {confidenceLabel(result.result.confidencePercent)}
                  </p>
                </div>
                <div className="bg-white border border-stone-200 rounded p-3 text-center">
                  <p className="text-xs text-stone-500 mb-1">Season</p>
                  <p className={`text-sm font-semibold ${SEASONAL_STATE_LABELS[result.result.seasonalState].color}`}>
                    {SEASONAL_STATE_LABELS[result.result.seasonalState].text}
                  </p>
                </div>
              </div>

              {/* Factor breakdown */}
              <div className="bg-stone-50 border border-stone-200 rounded p-4 mb-4">
                <h3 className="text-sm font-semibold text-stone-700 mb-3">Factors</h3>
                <div className="space-y-2 text-sm">
                  {(
                    [
                      ['Weather', result.explanation.weatherSupport],
                      ['Seasonal', result.explanation.seasonalSupport],
                      ['Species timing', result.explanation.speciesTimingSupport],
                    ] as [string, SupportLevel][]
                  ).map(([label, support]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-stone-600">{label}</span>
                      <span className={`font-medium ${SUPPORT_LABELS[support].color}`}>
                        {SUPPORT_LABELS[support].text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations */}
              {result.limitations.length > 0 && (
                <div className="text-xs text-stone-500 space-y-1">
                  {result.limitations.map((lim) => (
                    <p key={lim}>Note: {lim.replace(/-/g, ' ')}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
