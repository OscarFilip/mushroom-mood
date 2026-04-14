// Global test setup
// This file runs before all tests

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore console.log statements in tests
  log: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables if needed
process.env.NODE_ENV = 'test';