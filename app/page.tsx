'use client';

import { JSX, useState } from 'react';
import RainHistory from './features/rain-history/WeatherHistory';
import SpeciesObservations from './features/species-observation/SpeciesObservations';

export default function Page(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'weather' | 'species'>('weather');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Mushroom Environment Dashboard
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-6 py-3 rounded-md font-semibold transition ${
                activeTab === 'weather'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Weather History
            </button>
            <button
              onClick={() => setActiveTab('species')}
              className={`px-6 py-3 rounded-md font-semibold transition ${
                activeTab === 'species'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Species Observations
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'weather' && <RainHistory />}
          {activeTab === 'species' && <SpeciesObservations />}
        </div>
      </div>
    </div>
  );
}