"use client";

import React, { JSX, useState } from 'react';

interface SpeciesObservationData {
  id: string;
  scientificName: string;
  vernacularName?: string;
  date: string;
  latitude: number;
  longitude: number;
  uncertainty?: number;
  locality?: string;
  municipality?: string;
  county?: string;
  individualCount?: number;
  verificationStatus?: string;
}

interface ApiSpeciesObservationResponse {
  observations: SpeciesObservationData[];
  totalCount: number;
  searchParams: {
    speciesId: number;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
}

function SpeciesObservations(): JSX.Element {
  const [speciesId, setSpeciesId] = useState<string>('245630'); // Kantarell default
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [radiusMeters, setRadiusMeters] = useState<string>('3000');
  const [observationData, setObservationData] = useState<ApiSpeciesObservationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    if (!speciesId || !latitude || !longitude) return;
    
    setLoading(true);
    setObservationData(null);
    setError(null);
    
    try {
      console.log('🚀 Making API call with:', { speciesId, latitude, longitude, radiusMeters });
      
      const response = await fetch('/api/species-observations/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speciesId: parseInt(speciesId),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radiusMeters: parseInt(radiusMeters)
        }),
      });
      
      console.log('📡 API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: ApiSpeciesObservationResponse = await response.json();
      console.log('✅ API Response data:', data);
      console.log('🍄 Observations found:', data.observations.length);
      
      setObservationData(data);
    } catch (error) {
      console.error('💥 Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (lat: string, lon: string): void => {
    setLatitude(lat);
    setLongitude(lon);
  };

  const handleSpeciesClick = (id: string, name: string): void => {
    setSpeciesId(id);
  };

  // Sort observations by date (most recent first)
  const sortedObservations = observationData?.observations
    ? [...observationData.observations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="max-w-6xl mx-auto mt-8 font-sans">
      <h2 className="text-2xl font-bold text-center mb-6">Species Observations</h2>
      
      {/* Quick Species Buttons */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        <button
          onClick={() => handleSpeciesClick('245630', 'Kantarell')}
          className="px-3 py-1 text-sm bg-yellow-200 hover:bg-yellow-300 rounded"
        >
          Kantarell (245630)
        </button>
        <button
          onClick={() => handleSpeciesClick('245645', 'Karljohansvamp')}
          className="px-3 py-1 text-sm bg-brown-200 hover:bg-brown-300 rounded"
        >
          Karljohansvamp (245645)
        </button>
        <button
          onClick={() => handleSpeciesClick('245661', 'Trattkantarell')}
          className="px-3 py-1 text-sm bg-orange-200 hover:bg-orange-300 rounded"
        >
          Trattkantarell (245661)
        </button>
      </div>

      {/* Quick Location Buttons */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        <button
          onClick={() => handleLocationClick('57.1325', '12.6094')}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          Ullared, Sweden
        </button>
        <button
          onClick={() => handleLocationClick('59.3293', '18.0686')}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          Stockholm
        </button>
        <button
          onClick={() => handleLocationClick('57.7089', '11.9746')}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          Gothenburg
        </button>
      </div>
      
      <div className="flex gap-4 mb-6 justify-center flex-wrap">
        <input
          type="text"
          placeholder="Species ID"
          value={speciesId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeciesId(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 w-32 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatitude(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 w-32 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongitude(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 w-32 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Radius (m)"
          value={radiusMeters}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRadiusMeters(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 w-32 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={fetchData}
          disabled={!speciesId || !latitude || !longitude || loading}
          className={`px-4 py-2 rounded text-white font-semibold transition ${
            (!speciesId || !latitude || !longitude || loading)
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Searching...' : 'Search Observations'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {observationData && (
        <div className="space-y-6">
          {/* Search Info */}
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold text-lg mb-2">Search Results</h3>
            <p>Found <strong>{observationData.totalCount}</strong> observations for species ID <strong>{observationData.searchParams.speciesId}</strong></p>
            <p>Within <strong>{observationData.searchParams.radiusMeters}m</strong> of coordinates: {observationData.searchParams.latitude}, {observationData.searchParams.longitude}</p>
          </div>

          {/* Observations Table */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-xl font-semibold mb-4">Observations ({sortedObservations.length})</h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-green-600 text-white sticky top-0">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Scientific Name</th>
                    <th className="py-2 px-4 border-b text-left">Common Name</th>
                    <th className="py-2 px-4 border-b text-right">Lat</th>
                    <th className="py-2 px-4 border-b text-right">Lon</th>
                    <th className="py-2 px-4 border-b text-left">Location</th>
                    <th className="py-2 px-4 border-b text-right">Count</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedObservations.map((obs, idx) => (
                    <tr key={obs.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">
                        {new Date(obs.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b font-italic">
                        {obs.scientificName}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {obs.vernacularName || '-'}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {obs.latitude.toFixed(4)}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {obs.longitude.toFixed(4)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {obs.locality || obs.municipality || obs.county || '-'}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {obs.individualCount || '-'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs ${
                          obs.verificationStatus === 'Verified' 
                            ? 'bg-green-200 text-green-800'
                            : obs.verificationStatus === 'NotVerified'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {obs.verificationStatus || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold text-lg mb-2">Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p><strong>Total Observations:</strong> {sortedObservations.length}</p>
                <p><strong>Verified:</strong> {sortedObservations.filter(obs => obs.verificationStatus === 'Verified').length}</p>
              </div>
              <div>
                <p><strong>Date Range:</strong> {sortedObservations.length > 0 ? `${new Date(sortedObservations[sortedObservations.length - 1].date).toLocaleDateString()} - ${new Date(sortedObservations[0].date).toLocaleDateString()}` : 'N/A'}</p>
                <p><strong>Unique Locations:</strong> {new Set(sortedObservations.map(obs => `${obs.latitude},${obs.longitude}`)).size}</p>
              </div>
              <div>
                <p><strong>Individual Count Total:</strong> {sortedObservations.reduce((sum, obs) => sum + (obs.individualCount || 0), 0)}</p>
                <p><strong>With Count Data:</strong> {sortedObservations.filter(obs => obs.individualCount).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeciesObservations;