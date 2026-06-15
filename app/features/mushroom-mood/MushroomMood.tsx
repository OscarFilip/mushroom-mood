"use client";

import React, { JSX, useRef, useState } from 'react';
import { CURATED_SPECIES, SPECIES_ID_LIST, SpeciesId } from '../../../lib/data/mushroomSpecies';
import { ReadinessResult } from '../../../lib/services/mushroomReadinessService';
import {
  toReadinessResultViewModel,
  ReadinessResultViewModel,
} from '../../../lib/viewModels/readinessResultViewModel';

const PRESET_SPOTS = [
  { label: 'Ullared, Sweden', lat: '57.1134', lon: '12.7732' },
  { label: 'Stockholm', lat: '59.3293', lon: '18.0686' },
  { label: 'Gothenburg', lat: '57.7089', lon: '11.9746' },
];

function ResultCard({ vm }: { vm: ReadinessResultViewModel }): JSX.Element {
  return (
    <section>
      {/* Main result card */}
      <div className={`rounded-lg p-5 mb-4 ${vm.readinessLabelStyle.bg}`}>
        <p className={`text-xs uppercase tracking-wide font-semibold mb-1 opacity-80 ${vm.readinessLabelStyle.text}`}>
          Readiness
        </p>
        <p className={`text-2xl font-bold mb-2 ${vm.readinessLabelStyle.text}`}>
          {vm.readinessLabel}
        </p>
        <div className={`text-sm space-y-1 opacity-90 ${vm.readinessLabelStyle.text}`}>
          <p><span className="opacity-70">Species: </span>{vm.speciesDisplay} · <span className="italic">{vm.speciesLatin}</span></p>
          <p><span className="opacity-70">Spot: </span>{vm.spotDisplay}</p>
          <p><span className="opacity-70">Checked: </span>{vm.checkedAt}</p>
        </div>
      </div>

      {/* Compact metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
        <div className="bg-white border border-stone-200 rounded p-3">
          <p className="text-xs text-stone-500 mb-1">Readiness score</p>
          <p className="text-xl font-bold text-stone-800">{vm.readinessScore}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded p-3">
          <p className="text-xs text-stone-500 mb-1">Confidence</p>
          <p className="text-sm font-semibold text-stone-800">{vm.confidenceDisplay}</p>
          <p className="text-xs text-stone-400 mt-1">{vm.confidenceHelper}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded p-3">
          <p className="text-xs text-stone-500 mb-1">Seasonal timing</p>
          <p className={`text-sm font-semibold ${vm.seasonalTimingColor}`}>{vm.seasonalTimingLabel}</p>
        </div>
      </div>

      {/* Limitation banner */}
      {vm.limitationBanner && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded mb-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">{vm.limitationBanner.title}</p>
          <p className="text-sm text-amber-700">{vm.limitationBanner.body}</p>
          {vm.limitationBanner.bullets.length > 0 && (
            <ul className="mt-2 text-xs text-amber-700 space-y-1 list-disc list-inside">
              {vm.limitationBanner.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Details section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Why this result?</h3>

        {/* Weather signals */}
        <div className="bg-stone-50 border border-stone-200 rounded p-4 mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Weather signals</h4>
          <div className="space-y-2 text-sm text-stone-700">
            <div>
              <span className="text-stone-500 text-xs">Recent rain: </span>
              {vm.weatherSignals.recentRain}
            </div>
            <div>
              <span className="text-stone-500 text-xs">Moisture history: </span>
              {vm.weatherSignals.moistureHistory}
            </div>
            <div>
              <span className="text-stone-500 text-xs">Temperature: </span>
              {vm.weatherSignals.temperature}
            </div>
            <div>
              <span className="text-stone-500 text-xs">Weather history: </span>
              {vm.weatherSignals.weatherHistory}
            </div>
          </div>
        </div>

        {/* Seasonal evidence */}
        <div className="bg-stone-50 border border-stone-200 rounded p-4 mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Seasonal evidence</h4>
          <p className="text-sm text-stone-700">{vm.seasonalEvidence.sourceCopy}</p>
        </div>

        {/* Species fit */}
        <div className="bg-stone-50 border border-stone-200 rounded p-4 mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Species fit</h4>
          <p className="text-sm text-stone-700 mb-2">{vm.speciesFit.summary}</p>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>{vm.speciesFit.typicalSeason}</li>
            <li>{vm.speciesFit.temperatureRange}</li>
            <li>{vm.speciesFit.rainSignal}</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded text-xs text-stone-500 leading-relaxed">
        {vm.disclaimer}
      </div>
    </section>
  );
}

export default function MushroomMood(): JSX.Element {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [speciesId, setSpeciesId] = useState<SpeciesId>('cantharellus-cibarius');
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const canSubmit = latitude.trim() !== '' && longitude.trim() !== '' && !loading;

  async function checkReadiness(): Promise<void> {
    if (!canSubmit) return;

    // Abort any in-flight request before starting a new one.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = `/api/mushroom-readiness?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&species=${speciesId}`;
      const response = await fetch(url, { signal: controller.signal });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || `Request failed with status ${response.status}`);
      }

      // Only apply result if this request is still current (inputs may have changed).
      if (abortControllerRef.current === controller) {
        setResult(body as ReadinessResult);
      }
    } catch (err) {
      // Ignore aborted requests — the user changed inputs and a new request will follow.
      if (err instanceof Error && err.name === 'AbortError') return;
      if (abortControllerRef.current === controller) {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      // Only clear loading if this controller is still the current one.
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }

  function applyPreset(lat: string, lon: string): void {
    clearResultContext();
    setLatitude(lat);
    setLongitude(lon);
  }

  function clearResultContext(): void {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setResult(null);
    setError(null);
    setLoading(false);
  }

  const vm = result ? toReadinessResultViewModel(result) : null;

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
            onChange={(e) => { setLatitude(e.target.value); clearResultContext(); }}
            className="px-3 py-2 border border-stone-300 rounded w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => { setLongitude(e.target.value); clearResultContext(); }}
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
                onClick={() => { setSpeciesId(id); clearResultContext(); }}
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
      {vm && <ResultCard vm={vm} />}
    </div>
  );
}
