// Global test setup
// This file runs before all tests

global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

(process.env as Record<string, string | undefined>).NODE_ENV = 'test';
