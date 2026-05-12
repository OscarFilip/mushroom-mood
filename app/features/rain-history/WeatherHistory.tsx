"use client";

import React, { JSX, useState } from 'react';
import RainHistoryChart from './RainHistoryChart';
import TemperatureHistoryChart from './TemperatureHistoryChart';

interface ApiWeatherDataResponse {
  rainStation: {
    id: number | null;
    key: string;
    name: string;
    title: string;
    latitude: number;
    longitude: number;
    active: boolean;
    rainFallMeasurements: Array<{
      date: string;
      rainFall: number;
    }>;
  } | null;
  temperatureStation: {
    id: number | null;
    key: string;
    name: string;
    title: string;
    latitude: number;
    longitude: number;
    active: boolean;
    temperatureMeasurements: Array<{
      date: string;
      temperature: number;
    }>;
  } | null;
}

function RainHistory(): JSX.Element {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [weatherData, setWeatherData] = useState<ApiWeatherDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    if (!latitude || !longitude) return;
    
    setLoading(true);
    setWeatherData(null);
    setError(null);
    
    try {
      console.log('🚀 Making API call with:', { latitude, longitude });
      const response = await fetch(`/api/weather-history/rainy-days?latitude=${latitude}&longitude=${longitude}`);
      
      console.log('📡 API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: ApiWeatherDataResponse = await response.json();
      console.log('✅ API Response data:', data);
      console.log('🌧️ Rain station data:', data.rainStation);
      console.log('🌡️ Temperature station data:', data.temperatureStation);
      
      if (data.rainStation) {
        console.log('Rain measurements count:', data.rainStation.rainFallMeasurements?.length || 0);
        console.log('First few rain measurements:', data.rainStation.rainFallMeasurements?.slice(0, 3));
      }
      
      if (data.temperatureStation) {
        console.log('Temperature measurements count:', data.temperatureStation.temperatureMeasurements?.length || 0);
        console.log('First few temperature measurements:', data.temperatureStation.temperatureMeasurements?.slice(0, 3));
      }
      
      setWeatherData(data);
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

  // Check if data is from the same station
  const isSameStation = weatherData?.rainStation && weatherData?.temperatureStation 
    ? weatherData.rainStation.key === weatherData.temperatureStation.key
    : false;

  // Sort data for display
  const sortedRainData = weatherData?.rainStation?.rainFallMeasurements
    ? [...weatherData.rainStation.rainFallMeasurements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const sortedTempData = weatherData?.temperatureStation?.temperatureMeasurements
    ? [...weatherData.temperatureStation.temperatureMeasurements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="max-w-6xl mx-auto mt-8 font-sans">
      <h2 className="text-2xl font-bold text-center mb-6">Weather History</h2>
      
      {/* Quick Location Buttons */}
      <div className="flex gap-2 mb-4 justify-center flex-wrap">
        <button
          onClick={() => handleLocationClick('57.1134', '12.7732')}
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
      
      <div className="flex gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatitude(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongitude(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchData}
          disabled={!latitude || !longitude || loading}
          className={`px-4 py-2 rounded text-white font-semibold transition ${
            (!latitude || !longitude || loading)
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {weatherData && (
        <div className="space-y-6">
          {/* Station Info */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-lg mb-2">Station Information</h3>
            {isSameStation ? (
              <p>Both rain and temperature data from: <strong>{weatherData.rainStation?.name}</strong></p>
            ) : (
              <div className="space-y-1">
                {weatherData.rainStation && (
                  <p>Rain data from: <strong>{weatherData.rainStation.name}</strong> (Key: {weatherData.rainStation.key})</p>
                )}
                {weatherData.temperatureStation && (
                  <p>Temperature data from: <strong>{weatherData.temperatureStation.name}</strong> (Key: {weatherData.temperatureStation.key})</p>
                )}
              </div>
            )}
          </div>

          {/* Charts */}
          {sortedRainData.length > 0 && (
            <div className="bg-white shadow rounded p-6">
              <h3 className="text-xl font-semibold mb-4">Rainfall Chart</h3>
              <RainHistoryChart data={sortedRainData} />
            </div>
          )}

          {sortedTempData.length > 0 && (
            <div className="bg-white shadow rounded p-6">
              <h3 className="text-xl font-semibold mb-4">Temperature Chart</h3>
              <TemperatureHistoryChart data={sortedTempData} />
            </div>
          )}

          {/* Data Tables */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Rain Data */}
            {weatherData.rainStation && (
              <div className="bg-white shadow rounded p-6">
                <h3 className="text-xl font-semibold mb-4">Rainfall Data ({sortedRainData.length} days)</h3>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-blue-600 text-white sticky top-0">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-right">Rainfall (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRainData.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4 border-b">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            {Math.round(item.rainFall * 10) / 10}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Temperature Data */}
            {weatherData.temperatureStation && (
              <div className="bg-white shadow rounded p-6">
                <h3 className="text-xl font-semibold mb-4">Temperature Data ({sortedTempData.length} days)</h3>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-red-600 text-white sticky top-0">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-right">Temperature (°C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTempData.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4 border-b">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            {item.temperature.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold text-lg mb-2">Summary</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {weatherData.rainStation && (
                <div>
                  <p><strong>Total Rainfall:</strong> {sortedRainData.reduce((sum, item) => sum + item.rainFall, 0).toFixed(1)} mm</p>
                  <p><strong>Rainy Days:</strong> {sortedRainData.filter(item => item.rainFall > 0).length}</p>
                </div>
              )}
              {weatherData.temperatureStation && (
                <div>
                  <p><strong>Average Temperature:</strong> {sortedTempData.length > 0 ? (sortedTempData.reduce((sum, item) => sum + item.temperature, 0) / sortedTempData.length).toFixed(1) : '0'} °C</p>
                  <p><strong>Min/Max Temperature:</strong> {Math.min(...sortedTempData.map(i => i.temperature)).toFixed(1)} / {Math.max(...sortedTempData.map(i => i.temperature)).toFixed(1)} °C</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RainHistory;