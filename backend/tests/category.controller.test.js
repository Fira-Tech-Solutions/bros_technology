import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} = await import('../src/modules/properties/category.controller.js');

function mockReq(overrides = {}) {
  return { params: {}, body: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockNext = jest.fn();

describe('CategoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories with listingCount', async () => {
      const categories = [
        {
          id: 'c1', name: 'CARS', displayName: 'Cars', icon: 'car',
          schemaRules: [], createdAt: new Date(), updatedAt: new Date(),
          _count: { listings: 5 },
        },
        {
          id: 'c2', name: 'HOUSES', displayName: 'Houses', icon: 'home',
          schemaRules: [], createdAt: new Date(), updatedAt: new Date(),
          _count: { listings: 0 },
        },
      ];
      mockPrisma.category.findMany.mockResolvedValue(categories);

      const req = mockReq();
      const res = mockRes();

      await getAllCategories(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'c1', listingCount: 5 }),
          expect.objectContaining({ id: 'c2', listingCount: 0 }),
        ]),
      });
      expect(res.json.mock.calls[0][0].data[0]._count).toBeUndefined();
    });

    it('should call next on error', async () => {
      mockPrisma.category.findMany.mockRejectedValue(new Error('DB down'));
      await getAllCategories(mockReq(), mockRes(), mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ message: 'DB down' }));
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id with listingCount', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 'c1', name: 'CARS', displayName: 'Cars', icon: 'car',
        schemaRules: [], createdAt: new Date(), updatedAt: new Date(),
        _count: { listings: 3 },
      });

      const res = mockRes();
      await getCategoryById(mockReq({ params: { id: 'c1' } }), res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ id: 'c1', listingCount: 3 }),
      });
    });

    it('should return 404 if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      const res = mockRes();
      await getCategoryById(mockReq({ params: { id: 'missing' } }), res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });

    it('should call next on error', async () => {
      mockPrisma.category.findUnique.mockRejectedValue(new Error('timeout'));
      await getCategoryById(mockReq({ params: { id: 'c1' } }), mockRes(), mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('should create a category and return 201', async () => {
      mockPrisma.category.create.mockResolvedValue({
        id: 'new', name: 'CARS', displayName: 'Cars', icon: 'car',
        schemaRules: [], createdAt: new Date(), updatedAt: new Date(),
      });

      const res = mockRes();
      const req = mockReq({ body: { name: 'cars', displayName: 'Cars', icon: 'car' } });
      await createCategory(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'CARS', displayName: 'Cars' }),
      });
    });

    it('should default icon to "tag" if not provided', async () => {
      mockPrisma.category.create.mockResolvedValue({ id: 'new' });
      const res = mockRes();
      await createCategory(mockReq({ body: { name: 'x', displayName: 'X' } }), res, mockNext);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ icon: 'tag' }),
      });
    });

    it('should return 400 if name is missing', async () => {
      const res = mockRes();
      await createCategory(mockReq({ body: { displayName: 'X' } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].error).toMatch(/required/i);
    });

    it('should return 400 if displayName is missing', async () => {
      const res = mockRes();
      await createCategory(mockReq({ body: { name: 'x' } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if schemaRules is not an array', async () => {
      const res = mockRes();
      await createCategory(mockReq({ body: { name: 'x', displayName: 'X', schemaRules: 'bad' } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].error).toMatch(/array/i);
    });

    it('should return 400 if schemaRules entry lacks field or type', async () => {
      const res = mockRes();
      await createCategory(mockReq({ body: { name: 'x', displayName: 'X', schemaRules: [{ field: 'mileage' }] } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].error).toMatch(/field.*type/i);
    });

    it('should return 409 on unique constraint violation', async () => {
      const err = new Error('Unique');
      err.code = 'P2002';
      mockPrisma.category.create.mockRejectedValue(err);

      const res = mockRes();
      await createCategory(mockReq({ body: { name: 'cars', displayName: 'Cars' } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should call next on unexpected error', async () => {
      mockPrisma.category.create.mockRejectedValue(new Error('boom'));
      await createCategory(mockReq({ body: { name: 'x', displayName: 'X' } }), mockRes(), mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update and return 200', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.category.update.mockResolvedValue({
        id: 'c1', name: 'NEW', displayName: 'New', icon: 'star', schemaRules: [],
      });

      const res = mockRes();
      await updateCategory(
        mockReq({ params: { id: 'c1' }, body: { name: 'new', displayName: 'New', icon: 'star' } }),
        res, mockNext,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { name: 'NEW', displayName: 'New', icon: 'star' },
      });
    });

    it('should return 404 if category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      const res = mockRes();
      await updateCategory(mockReq({ params: { id: 'nope' }, body: {} }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if schemaRules is not an array', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'c1' });
      const res = mockRes();
      await updateCategory(mockReq({ params: { id: 'c1' }, body: { schemaRules: 'bad' } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 on unique constraint violation', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'c1' });
      const err = new Error('Unique');
      err.code = 'P2002';
      mockPrisma.category.update.mockRejectedValue(err);

      const res = mockRes();
      await updateCategory(mockReq({ params: { id: 'c1' }, body: { name: 'dup' } }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should call next on unexpected error', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.category.update.mockRejectedValue(new Error('boom'));
      await updateCategory(mockReq({ params: { id: 'c1' }, body: {} }), mockRes(), mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
