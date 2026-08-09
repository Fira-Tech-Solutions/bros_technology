import prisma from '../../config/prisma.js';

export async function getAssetStats(req, res, next) {
  try {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        price: true,
        status: true,
        categoryId: true,
        stockQuantity: true,
        category: {
          select: { id: true, name: true, displayName: true },
        },
      },
    });

    const statusCounts = { AVAILABLE: 0, SOLD: 0, PENDING: 0, ARCHIVED: 0 };
    let totalValue = 0;
    let totalStock = 0;

    const categoryMap = {};

    for (const l of listings) {
      const price = Number(l.price) || 0;
      const stock = l.stockQuantity || 0;
      totalValue += price;
      totalStock += stock;

      if (statusCounts[l.status] !== undefined) {
        statusCounts[l.status]++;
      }

      const catId = l.categoryId;
      const catName = l.category?.displayName || l.category?.name || 'Uncategorized';

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          categoryId: catId,
          categoryName: catName,
          count: 0,
          available: 0,
          sold: 0,
          pending: 0,
          archived: 0,
          totalValue: 0,
          totalStock: 0,
        };
      }

      const cat = categoryMap[catId];
      cat.count++;
      cat.totalValue += price;
      cat.totalStock += stock;

      if (l.status === 'AVAILABLE') cat.available++;
      else if (l.status === 'SOLD') cat.sold++;
      else if (l.status === 'PENDING') cat.pending++;
      else if (l.status === 'ARCHIVED') cat.archived++;
    }

    const byCategory = Object.values(categoryMap).sort((a, b) => b.count - a.count);

    return res.json({
      success: true,
      data: {
        totalAssets: listings.length,
        totalValue: Math.round(totalValue * 100) / 100,
        totalStock,
        ...statusCounts,
        byCategory,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateListingCommission(req, res, next) {
  try {
    const { id } = req.params;
    const { commissionPercent } = req.body;

    const percent = commissionPercent !== null && commissionPercent !== undefined
      ? parseFloat(commissionPercent)
      : null;

    if (percent !== null && (isNaN(percent) || percent < 0 || percent > 100)) {
      return res.status(400).json({
        success: false,
        error: 'commissionPercent must be between 0 and 100',
      });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: { commissionPercent: percent },
      select: { id: true, title: true, price: true, commissionPercent: true },
    });

    return res.json({
      success: true,
      data: {
        ...listing,
        price: Number(listing.price),
        commissionPercent: Number(listing.commissionPercent) || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    next(err);
  }
}

export async function getCommissionSummary(req, res, next) {
  try {
    const listings = await prisma.listing.findMany({
      where: { commissionPercent: { not: null } },
      select: {
        id: true,
        price: true,
        commissionPercent: true,
        status: true,
        agentId: true,
      },
    });

    let totalCommissionValue = 0;
    let collectedCommission = 0;
    let pendingCommission = 0;

    const agentMap = {};

    for (const l of listings) {
      const percent = Number(l.commissionPercent) || 0;
      const price = Number(l.price) || 0;
      const amount = (price * percent) / 100;

      totalCommissionValue += amount;

      if (l.status === 'SOLD') {
        collectedCommission += amount;
      } else if (l.status === 'AVAILABLE' || l.status === 'PENDING') {
        pendingCommission += amount;
      }

      agentMap[l.agentId] = (agentMap[l.agentId] || 0) + 1;
    }

    const totalListings = listings.length;
    const agentsWithCommission = Object.keys(agentMap).length;

    return res.json({
      success: true,
      data: {
        totalCommissionValue: Math.round(totalCommissionValue * 100) / 100,
        collectedCommission: Math.round(collectedCommission * 100) / 100,
        pendingCommission: Math.round(pendingCommission * 100) / 100,
        totalListingsWithCommission: totalListings,
        agentsWithCommission,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCommissionListings(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const commissionFilter = req.query.commissionFilter || "set";

    const where = {};
    if (status && ["AVAILABLE", "PENDING", "SOLD", "ARCHIVED"].includes(status)) {
      where.status = status;
    }
    if (commissionFilter === "set") {
      where.commissionPercent = { not: null };
    } else if (commissionFilter === "unset") {
      where.commissionPercent = null;
    }

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const enriched = data.map((l) => {
      const percent = Number(l.commissionPercent) || 0;
      const price = Number(l.price) || 0;
      return {
        ...l,
        price: Number(l.price),
        commissionPercent: percent,
        commissionAmount: Math.round((price * percent) / 100 * 100) / 100,
      };
    });

    return res.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}
