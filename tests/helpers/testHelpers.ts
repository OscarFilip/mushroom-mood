type MockWeatherStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  [key: string]: unknown;
};

type MockRainRecord = {
  id: number;
  stationId: string;
  date: string;
  rainFall: number;
  temperature: number;
  humidity: number;
  [key: string]: unknown;
};

export function createMockWeatherStation(overrides: Partial<MockWeatherStation> = {}): MockWeatherStation {
  return {
    id: 'MOCK_STATION_001',
    name: 'Mock Weather Station',
    latitude: 40.7128,
    longitude: -74.0060,
    elevation: 100,
    ...overrides,
  };
}

export function createMockRainRecord(overrides: Partial<MockRainRecord> = {}): MockRainRecord {
  return {
    id: 1,
    stationId: 'MOCK_STATION_001',
    date: '2023-10-15',
    rainFall: 10.5,
    temperature: 18.2,
    humidity: 65,
    ...overrides,
  };
}

export function createMockRainRecords(count = 5, baseOverrides: Partial<MockRainRecord> = {}): MockRainRecord[] {
  const records: MockRainRecord[] = [];
  const today = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);

    records.push(createMockRainRecord({
      id: index + 1,
      date: date.toISOString().split('T')[0],
      rainFall: Math.random() * 50,
      ...baseOverrides,
    }));
  }

  return records;
}

export function assertObjectStructure(obj: Record<string, unknown>, expectedProperties: string[]): void {
  expect(obj).toBeDefined();
  expect(obj).not.toBeNull();

  expectedProperties.forEach((property) => {
    expect(obj).toHaveProperty(property);
  });
}

export const testCoordinates = {
  newYork: { latitude: 40.7128, longitude: -74.0060 },
  london: { latitude: 51.5074, longitude: -0.1278 },
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  sydney: { latitude: -33.8688, longitude: 151.2093 },
  northPole: { latitude: 90, longitude: 0 },
  southPole: { latitude: -90, longitude: 0 },
  equatorPrimeMeridian: { latitude: 0, longitude: 0 },
  invalid: [
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: 181 },
    { latitude: null, longitude: 0 },
    { latitude: 0, longitude: null },
  ],
};

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createSpy<TArgs extends unknown[], TResult>(implementation?: (...args: TArgs) => TResult) {
  return jest.fn(implementation);
}
