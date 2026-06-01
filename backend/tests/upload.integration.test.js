import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTestPng, createTestJpeg, createCorruptedFile, cleanupFixtures } from './fixtures/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = __dirname;

const mockPrisma = {
  user: { findUnique: jest.fn() },
  listing: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  category: { findUnique: jest.fn() },
};

const mockListingEmitter = { emit: jest.fn(), on: jest.fn(), off: jest.fn() };

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../src/core/listingEmitter.js', () => ({
  default: mockListingEmitter,
}));

jest.unstable_mockModule('../src/modules/users/auth.middleware.js', () => ({
  authenticate: () => (req, _res, next) => {
    req.user = { id: 'agent-001', email: 'a@b.com', name: 'Agent', phone: '+1', role: 'AGENT' };
    next();
  },
  authorize: () => (_req, _res, next) => next(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.unstable_mockModule('../src/modules/syndication/listeners/telegramListener.js', () => ({
  initializeListingListeners: jest.fn(),
}));

const { default: app } = await import('../src/app.js');

const MOCK_AGENT = { id: 'agent-001', name: 'Agent', phone: '+1' };
const MOCK_CATEGORY = {
  id: 'cat-001',
  name: 'REAL_ESTATE',
  displayName: 'Real Estate',
  icon: 'home',
  schemaRules: [],
};

const LISTING_RESPONSE = {
  id: 'listing-new-001',
  title: 'Test',
  images: [],
  category: MOCK_CATEGORY,
  agent: MOCK_AGENT,
};

describe('Upload Integration — POST /api/listings with images', () => {
  let pngPath;
  let jpgPath;
  let corruptedPath;

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    pngPath = await createTestPng('upload-test.png');
    jpgPath = await createTestJpeg('upload-test.jpg');
    corruptedPath = await createCorruptedFile('upload-corrupted.png');
  });

  afterAll(async () => {
    await cleanupFixtures(['upload-test.png', 'upload-test.jpg', 'upload-corrupted.png']);
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(MOCK_AGENT);
    mockPrisma.category.findUnique.mockResolvedValue(MOCK_CATEGORY);
    mockPrisma.listing.create.mockImplementation(async (args) => ({
      ...LISTING_RESPONSE,
      ...args.data,
      id: 'listing-new-001',
    }));
  });

  it('should upload a single PNG and return the processed path', async () => {
    const res = await request(app)
      .post('/api/listings')
      .field('title', 'Apartment with Photo')
      .field('description', 'Nice place')
      .field('price', '50000')
      .field('city', 'Addis Ababa')
      .field('neighborhood', 'Bole')
      .field('categoryId', 'cat-001')
      .field('agentId', 'agent-001')
      .attach('images', pngPath)
      .expect(201);

    expect(res.body.success).toBe(true);

    const createdData = mockPrisma.listing.create.mock.calls[0][0].data;
    expect(createdData.images).toHaveLength(1);
    expect(createdData.images[0]).toMatch(/^uploads\/.*\.webp$/);
  });

  it('should upload multiple images and return all processed paths', async () => {
    const res = await request(app)
      .post('/api/listings')
      .field('title', 'Multi-Photo Listing')
      .field('description', 'Many photos')
      .field('price', '75000')
      .field('city', 'Addis Ababa')
      .field('neighborhood', 'Mekelle')
      .field('categoryId', 'cat-001')
      .field('agentId', 'agent-001')
      .attach('images', pngPath)
      .attach('images', jpgPath)
      .expect(201);

    expect(res.body.success).toBe(true);

    const createdData = mockPrisma.listing.create.mock.calls[0][0].data;
    expect(createdData.images).toHaveLength(2);
    for (const img of createdData.images) {
      expect(img).toMatch(/^uploads\/.*\.webp$/);
    }
  });

  it('should reject an upload with an invalid file type', async () => {
    const res = await request(app)
      .post('/api/listings')
      .field('title', 'Bad Upload')
      .field('description', 'Test')
      .field('price', '10000')
      .field('city', 'Test')
      .field('neighborhood', 'Test')
      .field('categoryId', 'cat-001')
      .field('agentId', 'agent-001')
      .attach('images', Buffer.from('fake'), {
        filename: 'malware.exe',
        contentType: 'application/x-executable',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should store images array in database even when upload has files', async () => {
    await request(app)
      .post('/api/listings')
      .field('title', 'Store Paths')
      .field('description', 'Test')
      .field('price', '30000')
      .field('city', 'Test')
      .field('neighborhood', 'Test')
      .field('categoryId', 'cat-001')
      .field('agentId', 'agent-001')
      .attach('images', pngPath)
      .expect(201);

    const createdData = mockPrisma.listing.create.mock.calls[0][0].data;
    expect(Array.isArray(createdData.images)).toBe(true);
    expect(createdData.images[0]).toContain('uploads/');
  });

  it('should emit listing:created with images in the payload', async () => {
    await request(app)
      .post('/api/listings')
      .field('title', 'Emit Test')
      .field('description', 'Test')
      .field('price', '40000')
      .field('city', 'Test')
      .field('neighborhood', 'Test')
      .field('categoryId', 'cat-001')
      .field('agentId', 'agent-001')
      .attach('images', pngPath)
      .expect(201);

    expect(mockListingEmitter.emit).toHaveBeenCalledWith(
      'listing:created',
      expect.objectContaining({
        images: expect.arrayContaining([expect.stringMatching(/^uploads\/.*\.webp$/)]),
      }),
    );
  });

  it('should handle no images gracefully', async () => {
    const res = await request(app)
      .post('/api/listings')
      .field('title', 'No Photos')
      .field('description', 'Just text')
      .field('price', '20000')
      .field('city', 'Test')
      .field('neighborhood', 'Test')
      .field('categoryId', 'cat-001')
      .field('agentId', 'agent-001')
      .expect(201);

    const createdData = mockPrisma.listing.create.mock.calls[0][0].data;
    expect(createdData.images).toEqual([]);
  });
});
