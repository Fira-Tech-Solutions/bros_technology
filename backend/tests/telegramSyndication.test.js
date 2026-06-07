import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { EventEmitter } from 'events';

const realEmitter = new EventEmitter();
realEmitter.setMaxListeners(20);

const mockPrisma = {
  listing: { findUnique: jest.fn() },
  syndicationLog: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockSendListingToChannel = jest.fn();

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../src/core/listingEmitter.js', () => ({
  default: realEmitter,
}));

jest.unstable_mockModule('../src/modules/syndication/services/telegramBot.service.js', () => ({
  default: { sendListingToChannel: mockSendListingToChannel },
}));

const { initializeListingListeners } = await import(
  '../src/modules/syndication/listeners/telegramListener.js'
);

const LISTING_FIXTURE = {
  id: 'listing-tg-001',
  title: 'Modern Apartment in Bole',
  description: 'Spacious 3-bedroom apartment with city views.',
  price: 75000,
  city: 'Addis Ababa',
  neighborhood: 'Bole',
  images: ['uploads/apt-cover.webp'],
  attributes: { bedrooms: 3, bathrooms: 2 },
  status: 'AVAILABLE',
  customTelegramCaption: null,
  category: {
    id: 'cat-001',
    name: 'REAL_ESTATE',
    displayName: 'Real Estate',
    icon: 'home',
    schemaRules: [
      { field: 'bedrooms', type: 'number', required: true },
      { field: 'bathrooms', type: 'number', required: true },
    ],
  },
  agent: {
    id: 'agent-001',
    name: 'Abebe Kebede',
    phone: '+251911223344',
    email: 'abebe@test.com',
  },
};

const LOG_ENTRY_FIXTURE = {
  id: 'log-001',
  listingId: 'listing-tg-001',
  platform: 'TELEGRAM',
  status: 'PENDING',
  channelInfo: '-3656652872',
};

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('Telegram Syndication Async Integration', () => {
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

  afterEach(() => {
    realEmitter.removeAllListeners('listing:created');
    realEmitter.removeAllListeners('listing:updated');
  });

  describe('Event listener registration', () => {
    it('should register listeners for listing:created and listing:updated', () => {
      initializeListingListeners();

      expect(realEmitter.listenerCount('listing:created')).toBeGreaterThanOrEqual(1);
      expect(realEmitter.listenerCount('listing:updated')).toBeGreaterThanOrEqual(1);
    });
  });

  describe('listing:created event flow', () => {
    it('should call sendListingToChannel with the full listing object', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'SUCCESS' });
      mockSendListingToChannel.mockResolvedValue({
        platform: 'TELEGRAM',
        channelInfo: '-3656652872',
        messageId: 42,
        imagesSent: 1,
        captionLength: 200,
      });

      initializeListingListeners();

      realEmitter.emit('listing:created', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockPrisma.listing.findUnique).toHaveBeenCalledWith({
        where: { id: LISTING_FIXTURE.id },
        include: {
          category: true,
          agent: { select: { id: true, name: true, phone: true, email: true } },
        },
      });

      expect(mockSendListingToChannel).toHaveBeenCalledTimes(1);
      expect(mockSendListingToChannel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: LISTING_FIXTURE.id,
          title: LISTING_FIXTURE.title,
          images: LISTING_FIXTURE.images,
          category: LISTING_FIXTURE.category,
          agent: LISTING_FIXTURE.agent,
        }),
      );
    });

    it('should create a PENDING syndication log before calling the service', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'SUCCESS' });
      mockSendListingToChannel.mockResolvedValue({ messageId: 42 });

      initializeListingListeners();

      realEmitter.emit('listing:created', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockPrisma.syndicationLog.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.syndicationLog.create).toHaveBeenCalledWith({
        data: {
          listingId: LISTING_FIXTURE.id,
          platform: 'TELEGRAM',
          status: 'PENDING',
          channelInfo: expect.any(String),
        },
      });
    });

    it('should update log to SUCCESS after successful broadcast', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'SUCCESS' });
      mockSendListingToChannel.mockResolvedValue({ messageId: 42 });

      initializeListingListeners();

      realEmitter.emit('listing:created', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockPrisma.syndicationLog.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.syndicationLog.update).toHaveBeenCalledWith({
        where: { id: LOG_ENTRY_FIXTURE.id },
        data: { status: 'SUCCESS' },
      });
    });

    it('should update log to FAILED when sendListingToChannel throws', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'FAILED' });
      mockSendListingToChannel.mockRejectedValue(new Error('Telegram API timeout'));

      initializeListingListeners();

      realEmitter.emit('listing:created', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockPrisma.syndicationLog.update).toHaveBeenCalledWith({
        where: { id: LOG_ENTRY_FIXTURE.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Telegram API timeout',
        },
      });
    });

    it('should not crash when listing is not found in database', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(null);

      initializeListingListeners();

      realEmitter.emit('listing:created', 'nonexistent-id');

      await flushPromises();
      await flushPromises();

      expect(mockSendListingToChannel).not.toHaveBeenCalled();
      expect(mockPrisma.syndicationLog.create).not.toHaveBeenCalled();
    });

    it('should not crash when prisma.listing.findUnique throws', async () => {
      mockPrisma.listing.findUnique.mockRejectedValue(new Error('DB connection lost'));

      initializeListingListeners();

      realEmitter.emit('listing:created', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockSendListingToChannel).not.toHaveBeenCalled();
    });
  });

  describe('listing:updated event flow', () => {
    it('should call sendListingToChannel for updated listings', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'SUCCESS' });
      mockSendListingToChannel.mockResolvedValue({ messageId: 99 });

      initializeListingListeners();

      realEmitter.emit('listing:updated', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockSendListingToChannel).toHaveBeenCalledTimes(1);
      expect(mockSendListingToChannel).toHaveBeenCalledWith(
        expect.objectContaining({ id: LISTING_FIXTURE.id }),
      );
    });

    it('should log FAILED status when updated listing broadcast fails', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'FAILED' });
      mockSendListingToChannel.mockRejectedValue(new Error('Rate limit exceeded'));

      initializeListingListeners();

      realEmitter.emit('listing:updated', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockPrisma.syndicationLog.update).toHaveBeenCalledWith({
        where: { id: LOG_ENTRY_FIXTURE.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Rate limit exceeded',
        },
      });
    });
  });

  describe('Event isolation', () => {
    it('should not invoke the listener when a different event is emitted', async () => {
      initializeListingListeners();

      realEmitter.emit('listing:deleted', LISTING_FIXTURE.id);

      await flushPromises();
      await flushPromises();

      expect(mockPrisma.listing.findUnique).not.toHaveBeenCalled();
      expect(mockSendListingToChannel).not.toHaveBeenCalled();
    });

    it('should handle multiple rapid emissions without dropping events', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(LISTING_FIXTURE);
      mockPrisma.syndicationLog.create.mockResolvedValue(LOG_ENTRY_FIXTURE);
      mockPrisma.syndicationLog.update.mockResolvedValue({ ...LOG_ENTRY_FIXTURE, status: 'SUCCESS' });
      mockSendListingToChannel.mockResolvedValue({ messageId: 1 });

      initializeListingListeners();

      const ids = ['listing-1', 'listing-2', 'listing-3'];
      for (const id of ids) {
        realEmitter.emit('listing:created', id);
      }

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(mockPrisma.listing.findUnique).toHaveBeenCalledTimes(3);
      expect(mockSendListingToChannel).toHaveBeenCalledTimes(3);
    });
  });
});
