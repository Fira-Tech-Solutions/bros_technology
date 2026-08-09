import prisma from '../../config/prisma.js';
import listingEmitter from '../../core/listingEmitter.js';
import { cleanupImages } from '../../utils/imageProcessor.js';
import { createNotification } from '../notifications/notification.controller.js';

const LISTING_INCLUDE = {
  category: true,
  agent: {
    select: { id: true, name: true, phone: true, email: true },
  },
};

export async function createListing(req, res, next) {
  try {
    const {
      title,
      description,
      price,
      city,
      neighborhood,
      categoryId,
      agentId,
      attributes,
      customTelegramCaption,
      status,
      stockQuantity,
    } = req.body;

    if (!title || !price || !categoryId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, price, categoryId, agentId',
      });
    }

    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent with id "${agentId}" not found`,
      });
    }

    const images = req.images || [];

    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        images,
        attributes: attributes || {},
        categoryId,
        agentId,
        customTelegramCaption: customTelegramCaption || null,
        status: status || 'AVAILABLE',
        stockQuantity: stockQuantity != null ? parseInt(stockQuantity) : 1,
      },
      include: LISTING_INCLUDE,
    });

    listingEmitter.emit('listing:created', listing.id);

    // Create notification for the agent
    createNotification(
      agentId,
      'New Listing Created',
      `"${listing.title}" has been created successfully`,
      'LISTING_CREATED',
      { listingId: listing.id }
    );

    return res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
}

export async function getListings(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      categoryId,
      city,
      neighborhood,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    // AGENT role: only see their own listings
    if (req.user && req.user.role === 'AGENT') {
      where.agentId = req.user.id;
    }

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (neighborhood) {
      where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, displayName: true, icon: true } },
          agent: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getListingById(req, res, next) {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: LISTING_INCLUDE,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: `Listing with id "${id}" not found`,
      });
    }

    await prisma.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    listing.viewsCount += 1;

    return res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateListing(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Listing with id "${id}" not found`,
      });
    }

    const {
      title,
      description,
      price,
      city,
      neighborhood,
      categoryId,
      agentId,
      attributes,
      customTelegramCaption,
      status,
      stockQuantity,
    } = req.body;

    // Merge new images with existing ones (new images append, existing preserved)
    const images = req.images && req.images.length > 0
      ? [...existing.images, ...req.images]
      : existing.images;

    if (req.images && req.images.length > 0 && existing.images.length > 0) {
      cleanupImages(existing.images).catch((err) => {
        console.error('[Listing] Failed to cleanup old images:', err.message);
      });
    }

    const updateData = {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(price && { price: parseFloat(price) }),
      ...(city && { city: city.trim() }),
      ...(neighborhood && { neighborhood: neighborhood.trim() }),
      ...(categoryId && { categoryId }),
      ...(agentId && { agentId }),
      images,
      ...(attributes !== undefined && { attributes }),
      ...(customTelegramCaption !== undefined && { customTelegramCaption: customTelegramCaption || null }),
      ...(status && { status }),
      ...(stockQuantity != null && { stockQuantity: parseInt(stockQuantity) }),
    };

    let updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: LISTING_INCLUDE,
    });

    // Auto-decrement stock when status changes to SOLD
    if (status === 'SOLD' && updated.stockQuantity > 0) {
      const newStock = Math.max(0, updated.stockQuantity - 1);
      updated = await prisma.listing.update({
        where: { id },
        data: {
          stockQuantity: newStock,
          ...(newStock === 0 ? { status: 'ARCHIVED' } : {}),
        },
        include: LISTING_INCLUDE,
      });
    }

    listingEmitter.emit('listing:updated', updated.id);

    if (agentId) {
      createNotification(
        agentId,
        'Listing Updated',
        `"${updated.title}" has been updated`,
        'LISTING_UPDATED',
        { listingId: updated.id }
      );
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteListing(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Listing with id "${id}" not found`,
      });
    }

    if (existing.images && existing.images.length > 0) {
      cleanupImages(existing.images).catch((err) => {
        console.error('[Listing] Failed to cleanup images:', err.message);
      });
    }

    await prisma.listing.delete({ where: { id } });

    listingEmitter.emit('listing:deleted', id);

    return res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    next(error);
  }
}
