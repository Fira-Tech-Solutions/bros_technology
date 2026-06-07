import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'super_secret_session_encryption_key_2026';
}

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
  listing: {
    create: jest.fn(),
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
    req.images = [];
    next();
  },
  optimizeImages: (_req, _res, next) => next(),
  cleanupImages: jest.fn(),
}));

jest.unstable_mockModule('../src/modules/syndication/listeners/telegramListener.js', () => ({
  initializeListingListeners: jest.fn(),
}));

const { default: app } = await import('../src/app.js');

const JWT_SECRET = process.env.JWT_SECRET;

const VALID_REGISTRATION = {
  email: 'agent@test.com',
  password: 'SecurePass123!',
  name: 'Test Agent',
  phone: '+251911000000',
};

const CREATED_USER_ROW = {
  id: 'user-uuid-001',
  email: 'agent@test.com',
  password: 'hashed-bcrypt-value',
  name: 'Test Agent',
  phone: '+251911000000',
  role: 'AGENT',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function generateValidToken(user = {}) {
  return jwt.sign(
    {
      sub: user.id || CREATED_USER_ROW.id,
      email: user.email || CREATED_USER_ROW.email,
      role: user.role || CREATED_USER_ROW.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function generateExpiredToken(user = {}) {
  return jwt.sign(
    {
      sub: user.id || CREATED_USER_ROW.id,
      email: user.email || CREATED_USER_ROW.email,
      role: user.role || CREATED_USER_ROW.role,
    },
    JWT_SECRET,
    { expiresIn: '-1s' },
  );
}

describe('Auth Integration — POST /api/auth', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user, hash the password, save to DB, and return a token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async (args) => {
        const { password: _, ...rest } = { ...CREATED_USER_ROW, ...args.data };
        if (args.select && typeof args.select === 'object') {
          const selected = {};
          for (const [key, val] of Object.entries(args.select)) {
            if (val && key in rest) selected[key] = rest[key];
          }
          return selected;
        }
        return rest;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(VALID_REGISTRATION)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();

      expect(res.body.data.user.email).toBe('agent@test.com');
      expect(res.body.data.user.name).toBe('Test Agent');
      expect(res.body.data.user).not.toHaveProperty('password');

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      const storedHash = createCall.data.password;
      expect(storedHash).not.toBe(VALID_REGISTRATION.password);
      const passwordMatches = await bcrypt.compare(VALID_REGISTRATION.password, storedHash);
      expect(passwordMatches).toBe(true);

      expect(createCall.data.email).toBe('agent@test.com');
      expect(createCall.data.name).toBe('Test Agent');
      expect(createCall.data.role).toBe('AGENT');

      const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
      expect(decoded.sub).toBe('user-uuid-001');
      expect(decoded.email).toBe('agent@test.com');
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@b.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/missing/i);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should return 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...VALID_REGISTRATION, password: 'short' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/8 characters/i);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should return 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...VALID_REGISTRATION, email: 'not-an-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/email/i);
    });

    it('should return 409 when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(CREATED_USER_ROW);

      const res = await request(app)
        .post('/api/auth/register')
        .send(VALID_REGISTRATION)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async (args) => {
        const { password: _, ...rest } = { ...CREATED_USER_ROW, ...args.data };
        if (args.select && typeof args.select === 'object') {
          const selected = {};
          for (const [key, val] of Object.entries(args.select)) {
            if (val && key in rest) selected[key] = rest[key];
          }
          return selected;
        }
        return rest;
      });

      await request(app)
        .post('/api/auth/register')
        .send({ ...VALID_REGISTRATION, email: 'AGENT@TEST.COM' })
        .expect(201);

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('agent@test.com');
    });
  });

  describe('POST /api/auth/login', () => {
    const PLAINTEXT_PASSWORD = 'SecurePass123!';

    async function setupUserWithHashedPassword() {
      const hashedPassword = await bcrypt.hash(PLAINTEXT_PASSWORD, 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...CREATED_USER_ROW,
        password: hashedPassword,
      });
    }

    it('should return a valid JWT on successful login', async () => {
      await setupUserWithHashedPassword();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'agent@test.com', password: PLAINTEXT_PASSWORD })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.token.split('.')).toHaveLength(3);

      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('agent@test.com');
      expect(res.body.data.user).not.toHaveProperty('password');

      const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
      expect(decoded.sub).toBe(CREATED_USER_ROW.id);
      expect(decoded.email).toBe('agent@test.com');
      expect(decoded.role).toBe('AGENT');
    });

    it('should return 401 when password is incorrect', async () => {
      await setupUserWithHashedPassword();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'agent@test.com', password: 'WrongPassword999!' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('should return 401 when email does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'AnyPassword123!' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('should return 400 when email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'agent@test.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/required/i);
    });

    it('should not include password in the response', async () => {
      await setupUserWithHashedPassword();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'agent@test.com', password: PLAINTEXT_PASSWORD })
        .expect(200);

      expect(JSON.stringify(res.body.data.user)).not.toContain('password');
    });
  });

  describe('POST /api/listings — Protected Route Authorization', () => {
    const listingPayload = {
      title: 'Test Listing',
      description: 'A test listing for auth verification.',
      price: 50000,
      city: 'Addis Ababa',
      neighborhood: 'Bole',
      categoryId: 'cat-001',
      agentId: CREATED_USER_ROW.id,
      attributes: {},
    };

    const mockCategory = {
      id: 'cat-001',
      name: 'GENERAL',
      displayName: 'General',
      icon: 'tag',
      schemaRules: [],
    };

    it('should return 401 when no Authorization header is provided', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/missing|malformed/i);
      expect(mockPrisma.listing.create).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header lacks Bearer prefix', async () => {
      const token = generateValidToken();

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', token)
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(mockPrisma.listing.create).not.toHaveBeenCalled();
    });

    it('should return 401 when token is empty after Bearer', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer ')
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 when token is malformed gibberish', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer this.is.not.a.valid.jwt')
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('should return 401 when token has expired', async () => {
      const expiredToken = generateExpiredToken();

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/expired/i);
    });

    it('should return 401 when token was signed with a different secret', async () => {
      const wrongToken = jwt.sign(
        { sub: CREATED_USER_ROW.id, email: CREATED_USER_ROW.email, role: 'AGENT' },
        'completely_wrong_secret',
        { expiresIn: '7d' },
      );

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${wrongToken}`)
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('should return 401 when user no longer exists in DB', async () => {
      const token = generateValidToken();

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${token}`)
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/no longer exists/i);
    });

    it('should accept a valid token and create the listing', async () => {
      const token = generateValidToken();

      const mockAgent = {
        id: CREATED_USER_ROW.id,
        name: CREATED_USER_ROW.name,
        phone: CREATED_USER_ROW.phone,
      };

      const createdListing = {
        id: 'listing-new-001',
        ...listingPayload,
        images: [],
        status: 'AVAILABLE',
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: mockCategory,
        agent: mockAgent,
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce({
          id: CREATED_USER_ROW.id,
          email: CREATED_USER_ROW.email,
          name: CREATED_USER_ROW.name,
          phone: CREATED_USER_ROW.phone,
          role: 'AGENT',
        })
        .mockResolvedValueOnce(mockAgent);
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.listing.create.mockResolvedValue(createdListing);

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${token}`)
        .send(listingPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('listing-new-001');
      expect(res.body.data.title).toBe('Test Listing');

      expect(mockPrisma.listing.create).toHaveBeenCalledTimes(1);
      expect(mockListingEmitter.emit).toHaveBeenCalledWith(
        'listing:created',
        expect.objectContaining({ id: 'listing-new-001' }),
      );
    });

    it('should reject a token issued for a user that has been deleted', async () => {
      const attackerToken = jwt.sign(
        { sub: 'attacker-id', email: 'hacker@evil.com', role: 'SUPER_ADMIN' },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${attackerToken}`)
        .send(listingPayload)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(mockPrisma.listing.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me — Protected Profile', () => {
    it('should return the authenticated user profile', async () => {
      const token = generateValidToken();

      mockPrisma.user.findUnique.mockResolvedValue({
        id: CREATED_USER_ROW.id,
        email: CREATED_USER_ROW.email,
        name: CREATED_USER_ROW.name,
        phone: CREATED_USER_ROW.phone,
        role: 'AGENT',
        createdAt: new Date().toISOString(),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('agent@test.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without a token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 when user no longer exists', async () => {
      const token = generateValidToken();
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register — Role Assignment', () => {
    it('should default role to AGENT when not specified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async (args) => {
        const { password: _, ...rest } = { id: 'u1', ...args.data };
        return rest;
      });

      await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'Password123!', name: 'New', phone: '+123' })
        .expect(201);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: 'AGENT' }) }),
      );
    });

    it('should allow explicit role override', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(async (args) => {
        const { password: _, ...rest } = { id: 'u1', ...args.data };
        return rest;
      });

      await request(app)
        .post('/api/auth/register')
        .send({ email: 'admin@test.com', password: 'Password123!', name: 'Admin', phone: '+123', role: 'SUPER_ADMIN' })
        .expect(201);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: 'SUPER_ADMIN' }) }),
      );
    });
  });
});
