import mockPrisma from '../__mocks__/prisma.js';

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

export function getMockPrisma() {
  return mockPrisma;
}

export function resetMocks() {
  jest.clearAllMocks();
}

export function mockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    images: [],
    ...overrides,
  };
}

export function mockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
}

export function mockNext() {
  return jest.fn();
}
