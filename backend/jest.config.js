/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',

  // ---------------------------------------------------------------------------
  // Where Jest looks for test files
  // ---------------------------------------------------------------------------
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.{js,mjs,cjs}', '**/*.{test,spec}.{js,mjs,cjs}'],

  // ---------------------------------------------------------------------------
  // Module resolution — no transforms needed for native ESM
  // ---------------------------------------------------------------------------
  transform: {},

  // ---------------------------------------------------------------------------
  // Mock hygiene — clear mocks automatically between every test
  // ---------------------------------------------------------------------------
  clearMocks: true,
  restoreMocks: true,

  // ---------------------------------------------------------------------------
  // Global setup — runs once before the test suite, loads .env.test via the
  // `dotenv` import inside this file.  The beforeEach/afterAll hooks in
  // setup.js handle per-test database resets.
  // ---------------------------------------------------------------------------
  globalSetup: '<rootDir>/tests/globalSetup.js',

  // ---------------------------------------------------------------------------
  // Coverage
  // ---------------------------------------------------------------------------
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/prisma.js',
    '!src/modules/syndication/services/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // ---------------------------------------------------------------------------
  // Timing & output
  // ---------------------------------------------------------------------------
  verbose: true,
  testTimeout: 15000,
};
