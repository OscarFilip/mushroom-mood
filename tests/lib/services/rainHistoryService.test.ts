const mockGetAvailableStationsAsync = jest.fn();
const mockGetDailyRainAmountsLast3MonthsAsync = jest.fn();
const mockGetDailyAverageTemperatureLast3MonthsAsync = jest.fn();

jest.mock('@/lib/repositories/weatherDataRepository', () => ({
  WeatherDataRepository: Object.assign(
    jest.fn().mockImplementation(() => ({
      getAvailableStationsAsync: mockGetAvailableStationsAsync,
      getDailyRainAmountsLast3MonthsAsync: mockGetDailyRainAmountsLast3MonthsAsync,
      getDailyAverageTemperatureLast3MonthsAsync: mockGetDailyAverageTemperatureLast3MonthsAsync,
    })),
    {
      PARAMETER_RAINFALL: '7',
      PARAMETER_TEMPERATURE: '2',
    }
  ),
}));

import { WeatherStation } from '@/lib/models/WeatherStation';
import { WeatherDataRepository } from '@/lib/repositories/weatherDataRepository';
import { getHistoricalWeatherData } from '@/lib/services/rainHistoryService';

function createStationData(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    key: 'station-1',
    name: 'Test Station',
    title: 'Test Station Title',
    latitude: 57.11,
    longitude: 12.77,
    active: true,
    ...overrides,
  };
}

describe('getHistoricalWeatherData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns transformed rain and temperature data for the closest stations', async () => {
    mockGetAvailableStationsAsync
      .mockResolvedValueOnce({ station: [createStationData({ id: 11, key: 'rain-1', name: 'Rain Station' })] })
      .mockResolvedValueOnce({ station: [createStationData({ id: 22, key: 'temp-1', name: 'Temperature Station' })] });

    mockGetDailyRainAmountsLast3MonthsAsync.mockImplementation(async (station: WeatherStation) => {
      station.rainFallMeasurements = [[new Date('2026-01-10T00:00:00.000Z'), 12.5]];
      return station;
    });

    mockGetDailyAverageTemperatureLast3MonthsAsync.mockImplementation(async (station: WeatherStation & { temperatureMeasurements?: Array<[Date, number]> }) => {
      station.temperatureMeasurements = [[new Date('2026-01-10T00:00:00.000Z'), 4.2]];
      return station;
    });

    const result = await getHistoricalWeatherData(57.1134, 12.7732);

    expect(WeatherDataRepository).toHaveBeenCalledTimes(1);
    expect(mockGetAvailableStationsAsync).toHaveBeenNthCalledWith(1, '7');
    expect(mockGetAvailableStationsAsync).toHaveBeenNthCalledWith(2, '2');
    expect(mockGetDailyRainAmountsLast3MonthsAsync).toHaveBeenCalledWith(expect.any(WeatherStation));
    expect(mockGetDailyAverageTemperatureLast3MonthsAsync).toHaveBeenCalledWith(expect.any(WeatherStation));

    expect(result).toEqual({
      rainStation: expect.objectContaining({
        id: 11,
        key: 'rain-1',
        name: 'Rain Station',
        rainFallMeasurements: [
          {
            date: '2026-01-10T00:00:00.000Z',
            rainFall: 12.5,
          },
        ],
      }),
      temperatureStation: expect.objectContaining({
        id: 22,
        key: 'temp-1',
        name: 'Temperature Station',
        temperatureMeasurements: [
          {
            date: '2026-01-10T00:00:00.000Z',
            temperature: 4.2,
          },
        ],
      }),
    });
  });

  it('throws when no stations are available for either parameter', async () => {
    mockGetAvailableStationsAsync.mockResolvedValueOnce({ station: [] }).mockResolvedValueOnce({ station: [] });

    await expect(getHistoricalWeatherData(57.1134, 12.7732)).rejects.toThrow('No weather stations available');
  });

  it('throws when no nearby stations can be selected', async () => {
    mockGetAvailableStationsAsync
      .mockResolvedValueOnce({ station: [createStationData({ id: 11, key: 'rain-1' })] })
      .mockResolvedValueOnce({ station: [createStationData({ id: 22, key: 'temp-1' })] });

    jest.spyOn(WeatherStation, 'findClosestStation').mockReturnValue(null);

    await expect(getHistoricalWeatherData(57.1134, 12.7732)).rejects.toThrow('No nearby weather stations found');
    expect(mockGetDailyRainAmountsLast3MonthsAsync).not.toHaveBeenCalled();
    expect(mockGetDailyAverageTemperatureLast3MonthsAsync).not.toHaveBeenCalled();
  });

  it('returns partial data when one dataset fetch fails', async () => {
    mockGetAvailableStationsAsync
      .mockResolvedValueOnce({ station: [createStationData({ id: 11, key: 'rain-1', name: 'Rain Station' })] })
      .mockResolvedValueOnce({ station: [createStationData({ id: 22, key: 'temp-1', name: 'Temperature Station' })] });

    mockGetDailyRainAmountsLast3MonthsAsync.mockImplementation(async (station: WeatherStation) => {
      station.rainFallMeasurements = [[new Date('2026-01-11T00:00:00.000Z'), 3.1]];
      return station;
    });

    mockGetDailyAverageTemperatureLast3MonthsAsync.mockRejectedValue(new Error('Temperature fetch failed'));

    const result = await getHistoricalWeatherData(57.1134, 12.7732);

    expect(result.rainStation).toEqual(
      expect.objectContaining({
        key: 'rain-1',
        rainFallMeasurements: [
          {
            date: '2026-01-11T00:00:00.000Z',
            rainFall: 3.1,
          },
        ],
      })
    );
    expect(result.temperatureStation).toBeNull();
  });

  it('throws when all station data fetches fail', async () => {
    mockGetAvailableStationsAsync
      .mockResolvedValueOnce({ station: [createStationData({ id: 11, key: 'rain-1', name: 'Rain Station' })] })
      .mockResolvedValueOnce({ station: [createStationData({ id: 22, key: 'temp-1', name: 'Temperature Station' })] });

    mockGetDailyRainAmountsLast3MonthsAsync.mockRejectedValue(new Error('Rain fetch failed'));
    mockGetDailyAverageTemperatureLast3MonthsAsync.mockRejectedValue(new Error('Temperature fetch failed'));

    await expect(getHistoricalWeatherData(57.1134, 12.7732)).rejects.toThrow('Failed to retrieve any weather data from available stations');
  });
});
