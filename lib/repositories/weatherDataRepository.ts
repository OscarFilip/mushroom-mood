import { WeatherStation } from '../models/WeatherStation';
import { ApiClient } from './apiClient';
import { logDebug, summarizeMeasurements } from '../utils/observability';

interface StationsResponse {
  station: Array<{
    id: number;
    key: string;
    name: string;
    title: string;
    latitude: number;
    longitude: number;
    active: boolean;
  }>;
}

export class WeatherDataRepository {
  private version: string;
  private period: string;
  private apiClient: ApiClient;

  public static readonly PARAMETER_RAINFALL = '7';
  public static readonly PARAMETER_TEMPERATURE = '2';

  constructor() {
    this.version = 'latest';
    this.period = 'latest-months';
    this.apiClient = new ApiClient('https://opendata-download-metobs.smhi.se/api', {}, 'smhi');
  }

  public async getAvailableStationsAsync(parameter: string): Promise<StationsResponse> {
    const url = `/version/${this.version}/parameter/${parameter}.json`;
    const response = await this.apiClient.get<StationsResponse>(url);
    
    // Filter out inactive stations
    const totalStations = response.station?.length || 0;
    const activeStations = response.station?.filter(s => s.active) || [];
    
    logDebug('[smhi] station catalog', {
      parameter,
      totalStations,
      activeStations: activeStations.length,
      inactiveStations: totalStations - activeStations.length,
      sample: activeStations.slice(0, 3).map((station) => ({
        key: station.key,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
      })),
    });
    
    return {
      station: activeStations
    };
  }

  public async getDailyRainAmountsLast3MonthsAsync(station: WeatherStation): Promise<WeatherStation> {
    const key = station.key;
    const url = `/version/${this.version}/parameter/${WeatherDataRepository.PARAMETER_RAINFALL}/station/${station.key}/period/${this.period}/data.csv`;

    try {
      const csvText = await this.apiClient.getText(url);
      
      const dailyRain = new Map<string, number>();
      const lines = csvText.split('\n');
      let dataSection = false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      for (const line of lines) {
        if (!dataSection) {
          const trimmed = line.trim().replace('\uFEFF', '');
          if (trimmed.startsWith('Datum;Tid (UTC);Nederbördsmängd')) {
            dataSection = true;
            continue;
          }
          continue;
        }

        const columns = line.split(';');
        if (columns.length < 3) continue;

        const dateStr = columns[0]?.trim();
        const rainfallStr = columns[2]?.trim();
        
        if (!dateStr || !rainfallStr) continue;

        const date = new Date(dateStr);
        const rainfall = parseFloat(rainfallStr);

        if (isNaN(date.getTime()) || isNaN(rainfall)) continue;

        if (date >= threeMonthsAgo && date <= today) {
          const dateKey = date.toISOString().split('T')[0];
          
          if (!dailyRain.has(dateKey)) {
            dailyRain.set(dateKey, 0);
          }
          dailyRain.set(dateKey, dailyRain.get(dateKey)! + rainfall);
        }
      }

      const mappedEntries: Array<[Date, number]> = Array.from(dailyRain.entries())
        .map(([dateStr, rainfall]) => [new Date(dateStr), rainfall] as [Date, number]);

      const sortedRain: Array<[Date, number]> = mappedEntries
        .sort((a, b) => a[0].getTime() - b[0].getTime());
        
      station.rainFallMeasurements = sortedRain;
      logDebug('[smhi] rainfall measurements', {
        stationKey: station.key,
        stationName: station.name,
        summary: summarizeMeasurements(sortedRain, ([date, rainFall]) => ({
          date: date.toISOString(),
          rainFall,
        })),
      });
      return station;

    } catch (error) {
      console.error(`Failed to fetch or parse daily rain amounts for station ${key}:`, error);
      return station;
    }
  }

  public async getDailyAverageTemperatureLast3MonthsAsync(station: WeatherStation): Promise<WeatherStation> {
  const url = `/version/${this.version}/parameter/${WeatherDataRepository.PARAMETER_TEMPERATURE}/station/${station.key}/period/${this.period}/data.csv`;

  try {
    const csvText = await this.apiClient.getText(url);
    
    const dailyTemperature = new Map<string, number>();
    const lines = csvText.split('\n');
    let dataSection = false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    for (const line of lines) {
      if (!dataSection) {
        const trimmed = line.trim().replace('\uFEFF', '');
        if (trimmed.startsWith('Från Datum Tid (UTC);Till Datum Tid (UTC);Representativt dygn;Lufttemperatur')) {
          dataSection = true;
          continue;
        }
        continue;
      }

      const columns = line.split(';');
      if (columns.length < 4) continue;

      const dateStr = columns[2]?.trim(); // "Representativt dygn" column
      const temperatureStr = columns[3]?.trim(); // "Lufttemperatur" column
      
      if (!dateStr || !temperatureStr) continue;

      const date = new Date(dateStr);
      const temperature = parseFloat(temperatureStr);

      if (isNaN(date.getTime()) || isNaN(temperature)) continue;

      if (date >= threeMonthsAgo && date <= today) {
        const dateKey = date.toISOString().split('T')[0];
        
        dailyTemperature.set(dateKey, temperature);
      }
    }

    const mappedEntries: Array<[Date, number]> = Array.from(dailyTemperature.entries())
      .map(([dateStr, temperature]) => [new Date(dateStr), temperature] as [Date, number]);

    const sortedTemperature: Array<[Date, number]> = mappedEntries
      .sort((a, b) => a[0].getTime() - b[0].getTime());
      
    (station as any).temperatureMeasurements = sortedTemperature;
    logDebug('[smhi] temperature measurements', {
      stationKey: station.key,
      stationName: station.name,
      summary: summarizeMeasurements(sortedTemperature, ([date, temperature]) => ({
        date: date.toISOString(),
        temperature,
      })),
    });
    return station;

  } catch (error) {
    console.error(`Failed to fetch or parse daily temperature for station ${station.key}:`, error);
    return station;
  }
}
}