import prisma from '../../config/prisma.js';

function mapListingToProperty(listing) {
  const attrs = listing.attributes || {};
  const images = (listing.images || []).map((p) => {
    if (p.startsWith('http')) return p;
    return `${process.env.API_BASE_URL || 'http://localhost:5000'}/${p}`;
  });

  const inStock = attrs.inStock !== undefined ? attrs.inStock : listing.status === 'AVAILABLE';

  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    inStock,
    brand: attrs.brand || '',
    category: listing.category?.displayName || 'Device',
    tags: Object.entries(attrs)
      .filter(([k]) => !['listingType', 'brand', 'inStock'].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 5),
    hero: images[0] || '',
    gallery: images,
    description: listing.description,
    features: Object.entries(attrs)
      .filter(([k]) => !['listingType', 'brand', 'inStock'].includes(k))
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        return `${label}: ${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}`;
      }),
  };
}

export async function getPublicListings(req, res, next) {
  try {
    const {
      category,
      q,
      priceMin,
      priceMax,
      limit = 50,
    } = req.query;

    const where = { status: 'AVAILABLE' };

    if (category && category !== 'All') {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { displayName: { equals: category, mode: 'insensitive' } },
            { name: { equals: category, mode: 'insensitive' } },
          ],
        },
      });
      if (cat) where.categoryId = cat.id;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }

    const listings = await prisma.listing.findMany({
      where,
      take: Math.min(100, parseInt(limit, 10) || 50),
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, displayName: true, icon: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: listings.map(mapListingToProperty),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProperty(req, res, next) {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, displayName: true, icon: true } },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: mapListingToProperty(listing),
    });
  } catch (error) {
    next(error);
  }
}

export async function trackInquiryClick(req, res, next) {
  try {
    const { id } = req.params;
    const { method } = req.body;

    const validMethods = ['telegram', 'whatsapp', 'call'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid inquiry method. Must be: telegram, whatsapp, or call',
      });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    await prisma.listing.update({
      where: { id },
      data: { inquiryClicks: { increment: 1 } },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
