import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  listing: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
};

const mockListingEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../src/core/listingEmitter.js', () => ({
  default: mockListingEmitter,
}));

jest.unstable_mockModule('../src/utils/imageProcessor.js', () => ({
  processImages: (req, _res, next) => {
    req.images = req.body._mockImages || [];
    next();
  },
  optimizeImages: (_req, _res, next) => next(),
  cleanupImages: jest.fn(),
}));

jest.unstable_mockModule('../src/modules/users/auth.middleware.js', () => ({
  authenticate: () => (req, _res, next) => {
    req.user = {
      id: 'user-auth-001',
      email: 'agent@test.com',
      name: 'Test Agent',
      phone: '+251911000000',
      role: 'AGENT',
    };
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
const { DynamicValidationError } = await import(
  '../src/modules/properties/dynamic.validation.js'
);

describe('Properties Integration Tests', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/listings', () => {
    const validPayload = {
      title: 'Luxury Villa in Bole',
      description: 'Stunning 4-bedroom villa with modern finishes and garden.',
      price: 85000,
      city: 'Addis Ababa',
      neighborhood: 'Bole',
      categoryId: 'cat-real-estate-001',
      agentId: 'user-auth-001',
      attributes: {
        bedrooms: 4,
        bathrooms: 3,
        area: 350,
        furnished: true,
      },
    };

    it('should create a listing and return 201 with emitter spy', async () => {
      const mockAgent = {
        id: 'user-auth-001',
        name: 'Test Agent',
        phone: '+251911000000',
      };

      const mockCategory = {
        id: 'cat-real-estate-001',
        name: 'REAL_ESTATE',
        displayName: 'Real Estate',
        icon: 'home',
        schemaRules: [
          { field: 'bedrooms', type: 'number', required: true },
          { field: 'bathrooms', type: 'number', required: true },
          { field: 'area', type: 'number', required: false },
          { field: 'furnished', type: 'boolean', required: false },
        ],
      };

      const createdListing = {
        id: 'listing-new-001',
        ...validPayload,
        images: [],
        status: 'AVAILABLE',
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: mockCategory,
        agent: mockAgent,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.listing.create.mockResolvedValue(createdListing);

      const res = await request(app)
        .post('/api/listings')
        .send(validPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('listing-new-001');
      expect(res.body.data.title).toBe('Luxury Villa in Bole');
      expect(res.body.data.category.displayName).toBe('Real Estate');
      expect(res.body.data.agent.name).toBe('Test Agent');

      expect(mockPrisma.listing.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Luxury Villa in Bole',
            price: 85000,
            agentId: 'user-auth-001',
            categoryId: 'cat-real-estate-001',
          }),
        }),
      );

      expect(mockListingEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockListingEmitter.emit).toHaveBeenCalledWith(
        'listing:created',
        expect.objectContaining({
          id: 'listing-new-001',
          title: 'Luxury Villa in Bole',
        }),
      );
    });

    it('should coerce attribute types from schema rules', async () => {
      const mockAgent = { id: 'user-auth-001', name: 'Agent', phone: '+123' };
      const mockCategory = {
        id: 'cat-real-estate-001',
        name: 'REAL_ESTATE',
        displayName: 'Real Estate',
        icon: 'home',
        schemaRules: [
          { field: 'bedrooms', type: 'number', required: true },
          { field: 'furnished', type: 'boolean', required: false },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.listing.create.mockImplementation(async (args) => ({
        id: 'listing-coerced-001',
        ...args.data,
        category: mockCategory,
        agent: mockAgent,
      }));

      const payloadWithStrings = {
        ...validPayload,
        attributes: { bedrooms: '3', furnished: 'true' },
      };

      const res = await request(app)
        .post('/api/listings')
        .send(payloadWithStrings)
        .expect(201);

      expect(mockPrisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              bedrooms: 3,
              furnished: true,
            }),
          }),
        }),
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send({ title: 'Incomplete Listing' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(mockPrisma.listing.create).not.toHaveBeenCalled();
      expect(mockListingEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return 404 when agent does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/listings')
        .send(validPayload)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Agent');
      expect(mockPrisma.listing.create).not.toHaveBeenCalled();
    });

    it('should return 404 when category does not exist', async () => {
      const mockAgent = { id: 'user-auth-001', name: 'Agent', phone: '+123' };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/listings')
        .send(validPayload)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Category');
    });

    it('should return 422 when dynamic validation fails', async () => {
      const mockAgent = { id: 'user-auth-001', name: 'Agent', phone: '+123' };
      const mockCategory = {
        id: 'cat-real-estate-001',
        name: 'REAL_ESTATE',
        displayName: 'Real Estate',
        icon: 'home',
        schemaRules: [
          { field: 'bedrooms', type: 'number', required: true },
          { field: 'bathrooms', type: 'number', required: true },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const payloadMissingAttributes = {
        ...validPayload,
        attributes: {},
      };

      const res = await request(app)
        .post('/api/listings')
        .send(payloadMissingAttributes)
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Dynamic attribute validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'bedrooms', type: 'REQUIRED' }),
          expect.objectContaining({ field: 'bathrooms', type: 'REQUIRED' }),
        ]),
      );
      expect(mockPrisma.listing.create).not.toHaveBeenCalled();
    });

    it('should return 422 when attribute type is invalid', async () => {
      const mockAgent = { id: 'user-auth-001', name: 'Agent', phone: '+123' };
      const mockCategory = {
        id: 'cat-real-estate-001',
        name: 'REAL_ESTATE',
        displayName: 'Real Estate',
        icon: 'home',
        schemaRules: [
          { field: 'bedrooms', type: 'number', required: true },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const payloadBadType = {
        ...validPayload,
        attributes: { bedrooms: 'not-a-number' },
      };

      const res = await request(app)
        .post('/api/listings')
        .send(payloadBadType)
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'bedrooms', type: 'INVALID_TYPE' }),
        ]),
      );
    });
  });

  describe('PATCH /api/listings/:id', () => {
    const existingListing = {
      id: 'listing-exist-001',
      title: 'Old Title',
      description: 'Old description.',
      price: 50000,
      city: 'Addis Ababa',
      neighborhood: 'Mekelle',
      images: ['uploads/old.webp'],
      attributes: { bedrooms: 2 },
      categoryId: 'cat-real-estate-001',
      agentId: 'user-auth-001',
      status: 'AVAILABLE',
      viewsCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: {
        id: 'cat-real-estate-001',
        name: 'REAL_ESTATE',
        displayName: 'Real Estate',
        icon: 'home',
        schemaRules: [
          { field: 'bedrooms', type: 'number', required: true },
        ],
      },
      agent: {
        id: 'user-auth-001',
        name: 'Test Agent',
        phone: '+251911000000',
        email: 'agent@test.com',
      },
    };

    it('should update a listing and return 200 with emitter spy', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(existingListing);
      mockPrisma.category.findUnique.mockResolvedValue(existingListing.category);

      const updatedListing = {
        ...existingListing,
        title: 'Updated Luxury Villa',
        price: 95000,
        updatedAt: new Date().toISOString(),
      };

      mockPrisma.listing.update.mockResolvedValue(updatedListing);

      const res = await request(app)
        .patch('/api/listings/listing-exist-001')
        .send({
          title: 'Updated Luxury Villa',
          price: 95000,
          categoryId: 'cat-real-estate-001',
          attributes: { bedrooms: 4 },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Luxury Villa');
      expect(res.body.data.price).toBe(95000);

      expect(mockPrisma.listing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'listing-exist-001' },
          data: expect.objectContaining({
            title: 'Updated Luxury Villa',
            price: 95000,
          }),
        }),
      );

      expect(mockListingEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockListingEmitter.emit).toHaveBeenCalledWith(
        'listing:updated',
        expect.objectContaining({
          id: 'listing-exist-001',
          title: 'Updated Luxury Villa',
        }),
      );
    });

    it('should return 404 when listing does not exist', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(null);
      mockPrisma.category.findUnique.mockResolvedValue(existingListing.category);

      const res = await request(app)
        .patch('/api/listings/nonexistent-id')
        .send({ title: 'Updated', categoryId: 'cat-real-estate-001', attributes: { bedrooms: 2 } })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
      expect(mockListingEmitter.emit).not.toHaveBeenCalled();
    });

    it('should preserve existing images when no new images uploaded', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(existingListing);
      mockPrisma.category.findUnique.mockResolvedValue(existingListing.category);

      const updatedListing = {
        ...existingListing,
        title: 'Title Changed Only',
      };

      mockPrisma.listing.update.mockResolvedValue(updatedListing);

      await request(app)
        .patch('/api/listings/listing-exist-001')
        .send({ title: 'Title Changed Only', categoryId: 'cat-real-estate-001', attributes: { bedrooms: 2 } })
        .expect(200);

      expect(mockPrisma.listing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            images: ['uploads/old.webp'],
          }),
        }),
      );
    });

    it('should return 422 when updated attributes fail dynamic validation', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(existingListing);
      mockPrisma.category.findUnique.mockResolvedValue(existingListing.category);

      const res = await request(app)
        .patch('/api/listings/listing-exist-001')
        .send({
          attributes: {},
          categoryId: 'cat-real-estate-001',
        })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'bedrooms', type: 'REQUIRED' }),
        ]),
      );
      expect(mockListingEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/listings', () => {
    it('should return paginated listings', async () => {
      const mockListings = [
        { id: '1', title: 'Listing 1', category: {}, agent: {} },
        { id: '2', title: 'Listing 2', category: {}, agent: {} },
      ];

      mockPrisma.listing.findMany.mockResolvedValue(mockListings);
      mockPrisma.listing.count.mockResolvedValue(2);

      const res = await request(app)
        .get('/api/listings')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe('GET /api/listings/:id', () => {
    it('should return a single listing and increment views', async () => {
      const mockListing = {
        id: 'listing-001',
        title: 'Test',
        viewsCount: 5,
        category: {},
        agent: {},
      };

      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.listing.update.mockResolvedValue({});

      const res = await request(app)
        .get('/api/listings/listing-001')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.viewsCount).toBe(6);

      expect(mockPrisma.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-001' },
        data: { viewsCount: { increment: 1 } },
      });
    });

    it('should return 404 for nonexistent listing', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/listings/nonexistent')
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
