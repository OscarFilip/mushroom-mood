const mockGet = jest.fn();
const mockGetText = jest.fn();

jest.mock('@/lib/repositories/apiClient', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    get: mockGet,
    getText: mockGetText,
  })),
}));

const { WeatherStation } = require('@/lib/models/WeatherStation');
const { WeatherDataRepository } = require('@/lib/repositories/weatherDataRepository');

describe('WeatherDataRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-14T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('filters inactive stations from the station catalog', async () => {
    mockGet.mockResolvedValue({
      station: [
        { id: 1, key: 'a', name: 'Active A', title: 'A', latitude: 57.1, longitude: 12.7, active: true },
        { id: 2, key: 'b', name: 'Inactive B', title: 'B', latitude: 57.2, longitude: 12.8, active: false },
        { id: 3, key: 'c', name: 'Active C', title: 'C', latitude: 57.3, longitude: 12.9, active: true },
      ],
    });

    const repository = new WeatherDataRepository();
    const result = await repository.getAvailableStationsAsync(WeatherDataRepository.PARAMETER_RAINFALL);

    expect(mockGet).toHaveBeenCalledWith('/version/latest/parameter/7.json');
    expect(result).toEqual({
      station: [
        expect.objectContaining({ id: 1, active: true }),
        expect.objectContaining({ id: 3, active: true }),
      ],
    });
  });

  it('parses rainfall CSV, filters by date range, and aggregates rainfall by day', async () => {
    mockGetText.mockResolvedValue([
      'Stationsdata',
      '\uFEFFDatum;Tid (UTC);Nederbördsmängd',
      '2026-02-01;00:00:00;1.5',
      '2026-02-01;12:00:00;2.0',
      '2026-03-05;00:00:00;0.5',
      '2025-12-20;00:00:00;7.0',
      'invalid;00:00:00;2.0',
    ].join('\n'));

    const repository = new WeatherDataRepository();
    const station = new WeatherStation({ key: 'rain-station' });

    const result = await repository.getDailyRainAmountsLast3MonthsAsync(station);

    expect(mockGetText).toHaveBeenCalledWith('/version/latest/parameter/7/station/rain-station/period/latest-months/data.csv');
    expect(result.rainFallMeasurements).toEqual([
      [new Date('2026-02-01T00:00:00.000Z'), 3.5],
      [new Date('2026-03-05T00:00:00.000Z'), 0.5],
    ]);
  });

  it('parses temperature CSV and keeps only records in the last three months', async () => {
    mockGetText.mockResolvedValue([
      'Metadata',
      'Från Datum Tid (UTC);Till Datum Tid (UTC);Representativt dygn;Lufttemperatur',
      '2026-02-01 00:00:00;2026-02-01 23:59:59;2026-02-01;4.5',
      '2026-03-10 00:00:00;2026-03-10 23:59:59;2026-03-10;7.1',
      '2025-12-31 00:00:00;2025-12-31 23:59:59;2025-12-31;-2.0',
      '2026-02-15 00:00:00;2026-02-15 23:59:59;invalid;6.0',
    ].join('\n'));

    const repository = new WeatherDataRepository();
    const station = new WeatherStation({ key: 'temp-station' });

    const result = await repository.getDailyAverageTemperatureLast3MonthsAsync(station);

    expect(mockGetText).toHaveBeenCalledWith('/version/latest/parameter/2/station/temp-station/period/latest-months/data.csv');
    expect(result.temperatureMeasurements).toEqual([
      [new Date('2026-02-01T00:00:00.000Z'), 4.5],
      [new Date('2026-03-10T00:00:00.000Z'), 7.1],
    ]);
  });

  it('returns the original station unchanged when rainfall retrieval fails', async () => {
    mockGetText.mockRejectedValue(new Error('Network failure'));

    const repository = new WeatherDataRepository();
    const station = new WeatherStation({ key: 'rain-station' });

    const result = await repository.getDailyRainAmountsLast3MonthsAsync(station);

    expect(result).toBe(station);
    expect(result.rainFallMeasurements).toEqual([]);
  });
});