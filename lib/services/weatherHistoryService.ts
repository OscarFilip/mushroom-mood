import { WeatherDataRepository } from '../repositories/weatherDataRepository';
import { WeatherStation } from '../models/WeatherStation';
import { logDebug, logInfo, summarizeMeasurements } from '../utils/observability';

interface BaseWeatherStation {
  id: number | null;
  key: string;
  name: string;
  title: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

interface WeatherDataResponse {
  rainStation: (BaseWeatherStation & {
    rainFallMeasurements: Array<{ date: string; rainFall: number }>;
  }) | null;
  temperatureStation: (BaseWeatherStation & {
    temperatureMeasurements: Array<{ date: string; temperature: number }>;
  }) | null;
}

type RainWeatherStationResponse = BaseWeatherStation & {
  rainFallMeasurements: Array<{ date: string; rainFall: number }>;
};

type TemperatureWeatherStationResponse = BaseWeatherStation & {
  temperatureMeasurements: Array<{ date: string; temperature: number }>;
};

export async function getHistoricalWeatherData(latitude: number, longitude: number): Promise<WeatherDataResponse> {
  const repository = new WeatherDataRepository();

  try {
    // Get stations for both parameters separately
    const [rainfallStationsData, temperatureStationsData] = await Promise.all([
      repository.getAvailableStationsAsync(WeatherDataRepository.PARAMETER_RAINFALL),
      repository.getAvailableStationsAsync(WeatherDataRepository.PARAMETER_TEMPERATURE)
    ]);

    if ((!rainfallStationsData?.station || rainfallStationsData.station.length === 0) &&
        (!temperatureStationsData?.station || temperatureStationsData.station.length === 0)) {
      throw new Error('No weather stations available');
    }

    // Create station objects for rainfall
    const rainfallStations = rainfallStationsData?.station?.map(stationData =>
      new WeatherStation({
        id: stationData.id,
        key: stationData.key,
        name: stationData.name,
        title: stationData.title,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        active: stationData.active
      })
    ) || [];

    // Create station objects for temperature
    const temperatureStations = temperatureStationsData?.station?.map(stationData =>
      new WeatherStation({
        id: stationData.id,
        key: stationData.key,
        name: stationData.name,
        title: stationData.title,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        active: stationData.active
      })
    ) || [];

    // Find closest stations for each parameter
    const closestRainfallStation = rainfallStations.length > 0
      ? WeatherStation.findClosestStation(rainfallStations, latitude, longitude)
      : null;

    const closestTemperatureStation = temperatureStations.length > 0
      ? WeatherStation.findClosestStation(temperatureStations, latitude, longitude)
      : null;

    logInfo('[weather-history] selected stations', {
      latitude,
      longitude,
      rainStation: closestRainfallStation
        ? {
            key: closestRainfallStation.key,
            name: closestRainfallStation.name,
            latitude: closestRainfallStation.latitude,
            longitude: closestRainfallStation.longitude,
          }
        : null,
      temperatureStation: closestTemperatureStation
        ? {
            key: closestTemperatureStation.key,
            name: closestTemperatureStation.name,
            latitude: closestTemperatureStation.latitude,
            longitude: closestTemperatureStation.longitude,
          }
        : null,
    });

    if (!closestRainfallStation && !closestTemperatureStation) {
      throw new Error('No nearby weather stations found');
    }

    // Get data for each station independently
    const dataPromises = [];
    let rainStation: WeatherStation | null = null;
    let temperatureStation: WeatherStation | null = null;

    if (closestRainfallStation) {
      dataPromises.push(
        repository.getDailyRainAmountsLast3MonthsAsync(closestRainfallStation)
          .then(station => { rainStation = station; })
          .catch(error => {
            console.warn('Failed to get rainfall data:', error);
          })
      );
    }

    if (closestTemperatureStation) {
      dataPromises.push(
        repository.getDailyAverageTemperatureLast3MonthsAsync(closestTemperatureStation)
          .then(station => { temperatureStation = station; })
          .catch(error => {
            console.warn('Failed to get temperature data:', error);
          })
      );
    }

    await Promise.all(dataPromises);

    // Check if we got any data at all
    if (!rainStation && !temperatureStation) {
      throw new Error('Failed to retrieve any weather data from available stations');
    }

    const result: WeatherDataResponse = {
      rainStation: rainStation ? transformRainWeatherStationForApi(rainStation) : null,
      temperatureStation: temperatureStation ? transformTemperatureWeatherStationForApi(temperatureStation) : null,
    };

    logDebug('[weather-history] response', {
      latitude,
      longitude,
      rainStation: result.rainStation
        ? {
            key: result.rainStation.key,
            measurementSummary: summarizeMeasurements(result.rainStation.rainFallMeasurements, (measurement) => ({
              date: measurement.date,
              rainFall: measurement.rainFall,
            })),
          }
        : null,
      temperatureStation: result.temperatureStation
        ? {
            key: result.temperatureStation.key,
            measurementSummary: summarizeMeasurements(result.temperatureStation.temperatureMeasurements, (measurement) => ({
              date: measurement.date,
              temperature: measurement.temperature,
            })),
          }
        : null,
    });

    return result;

  } catch (error) {
    console.error('Error in getHistoricalWeatherData:', error);
    throw error;
  }
}

function transformRainWeatherStationForApi(station: WeatherStation): RainWeatherStationResponse {
  return {
    id: station.id,
    key: station.key,
    name: station.name,
    title: station.title,
    latitude: station.latitude,
    longitude: station.longitude,
    active: station.active,
    rainFallMeasurements: station.rainFallMeasurements.map(([date, rainFall]) => ({
      date: date.toISOString(),
      rainFall,
    })),
  };
}

function transformTemperatureWeatherStationForApi(
  station: WeatherStation & { temperatureMeasurements?: Array<[Date, number]> },
): TemperatureWeatherStationResponse {
  return {
    id: station.id,
    key: station.key,
    name: station.name,
    title: station.title,
    latitude: station.latitude,
    longitude: station.longitude,
    active: station.active,
    temperatureMeasurements: (station.temperatureMeasurements ?? []).map(([date, temperature]) => ({
      date: date.toISOString(),
      temperature,
    })),
  };
}
