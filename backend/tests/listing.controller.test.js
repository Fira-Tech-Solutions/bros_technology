import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  listing: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
};

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../src/core/listingEmitter.js', () => ({
  default: { emit: jest.fn() },
}));

jest.unstable_mockModule('../src/utils/imageProcessor.js', () => ({
  cleanupImages: jest.fn(),
}));

const { createListing, getListings, getListingById } = await import(
  '../src/modules/properties/listing.controller.js'
);

describe('ListingController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      images: [],
      user: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe('createListing', () => {
    const validBody = {
      title: 'Modern Apartment in Bole',
      description: 'Spacious 2 bedroom apartment',
      price: '45000',
      city: 'Addis Ababa',
      neighborhood: 'Bole',
      categoryId: 'cat-123',
      agentId: 'agent-456',
    };

    it('should return 400 if required fields are missing', async () => {
      req.body = { title: 'Test' };

      await createListing(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
    });

    it('should return 404 if agent not found', async () => {
      req.body = validBody;
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await createListing(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Agent'),
        }),
      );
    });

    it('should create listing and return 201', async () => {
      req.body = validBody;
      req.images = ['uploads/image1.webp'];

      const mockAgent = { id: 'agent-456', name: 'John', phone: '+123' };
      const mockListing = {
        id: 'listing-789',
        ...validBody,
        price: 45000,
        images: ['uploads/image1.webp'],
        attributes: {},
        status: 'AVAILABLE',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.listing.create.mockResolvedValue(mockListing);

      await createListing(req, res, next);

      expect(mockPrisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: validBody.title,
            agentId: validBody.agentId,
          }),
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockListing,
        }),
      );
    });

    it('should pass errors to next()', async () => {
      req.body = validBody;
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(dbError);

      await createListing(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
    });
  });

  describe('getListings', () => {
    it('should return paginated listings', async () => {
      req.query = { page: '1', limit: '10' };

      const mockListings = [
        { id: '1', title: 'Listing 1' },
        { id: '2', title: 'Listing 2' },
      ];

      mockPrisma.listing.findMany.mockResolvedValue(mockListings);
      mockPrisma.listing.count.mockResolvedValue(2);

      await getListings(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockListings,
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: 2,
          }),
        }),
      );
    });

    it('should apply filters from query params', async () => {
      req.query = {
        city: 'Addis Ababa',
        minPrice: '10000',
        maxPrice: '50000',
      };

      mockPrisma.listing.findMany.mockResolvedValue([]);
      mockPrisma.listing.count.mockResolvedValue(0);

      await getListings(req, res, next);

      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: expect.objectContaining({ contains: 'Addis Ababa' }),
            price: { gte: 10000, lte: 50000 },
          }),
        }),
      );
    });
  });

  describe('getListingById', () => {
    it('should return 404 if listing not found', async () => {
      req.params = { id: 'nonexistent' };
      mockPrisma.listing.findUnique.mockResolvedValue(null);

      await getListingById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return listing and increment views', async () => {
      req.params = { id: 'listing-123' };

      const mockListing = {
        id: 'listing-123',
        title: 'Test Listing',
        viewsCount: 10,
      };

      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.listing.update.mockResolvedValue({});

      await getListingById(req, res, next);

      expect(mockPrisma.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-123' },
        data: { viewsCount: { increment: 1 } },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ viewsCount: 11 }),
        }),
      );
    });
  });
});
