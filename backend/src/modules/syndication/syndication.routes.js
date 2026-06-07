import { Router } from 'express';
import prisma from '../../config/prisma.js';
import listingEmitter from '../../core/listingEmitter.js';
import { authenticate, authorize } from '../users/auth.middleware.js';

const router = Router();

router.get('/logs', authenticate(), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, listingId } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};
    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    if (req.user.role === 'AGENT') {
      where.listing = { agentId: req.user.id };
    }

    const [logs, total] = await Promise.all([
      prisma.syndicationLog.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { runAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              city: true,
              neighborhood: true,
              images: true,
            },
          },
        },
      }),
      prisma.syndicationLog.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
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
});

router.post('/retry/:id', authenticate(), async (req, res, next) => {
  try {
    const { id } = req.params;

    const log = await prisma.syndicationLog.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            category: true,
            agent: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: `Syndication log with id "${id}" not found`,
      });
    }

    if (req.user.role === 'AGENT' && log.listing.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to retry this syndication',
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: log.listingId },
      include: {
        category: true,
        agent: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'The associated listing no longer exists',
      });
    }

    listingEmitter.emit('listing:created', listing.id);

    await prisma.syndicationLog.update({
      where: { id },
      data: { status: 'PENDING', errorMessage: null },
    });

    return res.status(200).json({
      success: true,
      data: {
        id: log.id,
        listingId: log.listingId,
        status: 'PENDING',
        message: 'Re-syndication triggered successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
