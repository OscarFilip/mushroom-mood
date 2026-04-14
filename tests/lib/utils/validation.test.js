const { validateCoordinates } = require('@/lib/utils/validation');

describe('validateCoordinates', () => {
  it('does not throw for valid coordinates', () => {
    expect(() => validateCoordinates(57.1134, 12.7732)).not.toThrow();
  });

  it('throws when coordinates are not valid numbers', () => {
    expect(() => validateCoordinates(Number.NaN, 12.7732)).toThrow('Latitude and longitude must be valid numbers');
    expect(() => validateCoordinates(57.1134, Number.NaN)).toThrow('Latitude and longitude must be valid numbers');
  });

  it('throws when latitude is outside the valid range', () => {
    expect(() => validateCoordinates(91, 12.7732)).toThrow('Latitude must be between -90 and 90 degrees');
  });

  it('throws when longitude is outside the valid range', () => {
    expect(() => validateCoordinates(57.1134, 181)).toThrow('Longitude must be between -180 and 180 degrees');
  });
});