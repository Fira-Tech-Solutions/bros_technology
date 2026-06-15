import prisma from '../../config/prisma.js';

const DEFAULT_COORDS = { lat: 8.01, lng: 38.76 };

function mapListingToProperty(listing) {
  const attrs = listing.attributes || {};
  const images = (listing.images || []).map((p) => {
    if (p.startsWith('http')) return p;
    return `${process.env.API_BASE_URL || 'http://localhost:5000'}/${p}`;
  });

  const agent = listing.agent
    ? {
        id: listing.agent.id,
        name: listing.agent.name,
        phone: listing.agent.phone,
        email: listing.agent.email,
        profileImage: listing.agent.profileImage || null,
        facebook: listing.agent.facebook || null,
        twitter: listing.agent.twitter || null,
        instagram: listing.agent.instagram || null,
        linkedin: listing.agent.linkedin || null,
        telegram: listing.agent.telegram || null,
        whatsapp: listing.agent.whatsapp || null,
        tiktok: listing.agent.tiktok || null,
        youtube: listing.agent.youtube || null,
        website: listing.agent.website || null,
      }
    : null;

  return {
    id: listing.id,
    title: listing.title,
    location: `${listing.neighborhood}, ${listing.city}`,
    price: listing.price,
    beds: attrs.bedrooms || 0,
    baths: attrs.bathrooms || 0,
    area: attrs.area || 0,
    category: listing.category?.displayName || 'Property',
    tags: Object.entries(attrs)
      .filter(([k]) => k !== 'listingType' && k !== 'bedrooms' && k !== 'bathrooms' && k !== 'area')
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 5),
    hero: images[0] || '',
    gallery: images,
    description: listing.description,
    coords: attrs.coords || DEFAULT_COORDS,
    features: Object.entries(attrs)
      .filter(([k]) => k !== 'listingType' && k !== 'coords')
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        return `${label}: ${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}`;
      }),
    agent,
  };
}

export async function getPublicListings(req, res, next) {
  try {
    const {
      category,
      q,
      priceMin,
      priceMax,
      beds,
      baths,
      amenities,
      page = 1,
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
        { city: { contains: q, mode: 'insensitive' } },
        { neighborhood: { contains: q, mode: 'insensitive' } },
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

    let filtered = listings;

    if (beds) {
      filtered = filtered.filter((l) => (l.attributes?.bedrooms || 0) >= parseInt(beds, 10));
    }
    if (baths) {
      filtered = filtered.filter((l) => (l.attributes?.bathrooms || 0) >= parseInt(baths, 10));
    }
    if (amenities) {
      const list = amenities.split(',').map((a) => a.trim().toLowerCase());
      filtered = filtered.filter((l) =>
        list.every((a) => {
          const attrs = l.attributes || {};
          return Object.values(attrs).some(
            (v) => String(v).toLowerCase().includes(a)
          );
        })
      );
    }

    return res.status(200).json({
      success: true,
      data: filtered.map(mapListingToProperty),
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
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            profileImage: true,
            facebook: true,
            twitter: true,
            instagram: true,
            linkedin: true,
            telegram: true,
            whatsapp: true,
            tiktok: true,
            youtube: true,
            website: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
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
