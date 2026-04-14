import { WeatherStation } from '@/lib/models/WeatherStation';

describe('WeatherStation', () => {
  describe('findClosestStation', () => {
    it('should find the closest station from a list of stations', () => {
      const stations = [
        new WeatherStation({ id: 1, name: 'Station A', latitude: 40.0, longitude: -74.0 }),
        new WeatherStation({ id: 2, name: 'Station B', latitude: 41.0, longitude: -73.0 }),
        new WeatherStation({ id: 3, name: 'Station C', latitude: 40.1, longitude: -74.1 }),
      ];

      const result = WeatherStation.findClosestStation(stations, 40.05, -74.05);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(3);
      expect(result?.name).toBe('Station C');
    });

    it('should prefer an exact coordinate match when one exists', () => {
      const stations = [
        new WeatherStation({ id: 1, name: 'Nearby Station', latitude: 57.1133, longitude: 12.7731 }),
        new WeatherStation({ id: 2, name: 'Exact Match Station', latitude: 57.1134, longitude: 12.7732 }),
      ];

      const result = WeatherStation.findClosestStation(stations, 57.1134, 12.7732);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(2);
      expect(result?.name).toBe('Exact Match Station');
    });

    it('should return null when stations array is empty or null', () => {
      expect(WeatherStation.findClosestStation([], 40.0, -74.0)).toBeNull();
      expect(WeatherStation.findClosestStation(null as unknown as WeatherStation[], 40.0, -74.0)).toBeNull();
      expect(WeatherStation.findClosestStation(undefined as unknown as WeatherStation[], 40.0, -74.0)).toBeNull();
    });
  });
});
