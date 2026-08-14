import prisma from '../../config/prisma.js';

function mapListingToProperty(listing) {
  const attrs = listing.attributes || {};
  const images = (listing.images || []).map((p) => {
    if (p.startsWith('http')) return p;
    return `${process.env.API_BASE_URL || 'http://localhost:5000'}/${p}`;
  });

  const stockQuantity = listing.stockQuantity || 0;
  const inStock = stockQuantity > 0 || listing.status === 'AVAILABLE';

  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    inStock,
    stockQuantity,
    brand: attrs.brand || '',
    category: listing.category?.displayName || 'Device',
    categoryId: listing.categoryId,
    attributes: attrs,
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
      brand,
      condition,
      storage,
      ram,
      color,
      processor,
      screenSize,
      os,
      model,
      connectivity,
      caseSize,
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

    // Attribute-based filters using JSON path queries
    const attributeFilters = [];
    if (brand) attributeFilters.push({ path: ['brand'], equals: brand });
    if (condition) attributeFilters.push({ path: ['condition'], equals: condition });
    if (storage) attributeFilters.push({ path: ['storage'], equals: storage });
    if (ram) attributeFilters.push({ path: ['ram'], equals: ram });
    if (color) attributeFilters.push({ path: ['color'], equals: color });
    if (processor) attributeFilters.push({ path: ['processor'], equals: processor });
    if (screenSize) attributeFilters.push({ path: ['screenSize'], equals: screenSize });
    if (os) attributeFilters.push({ path: ['os'], equals: os });
    if (model) attributeFilters.push({ path: ['model'], equals: model });
    if (connectivity) attributeFilters.push({ path: ['connectivity'], equals: connectivity });
    if (caseSize) attributeFilters.push({ path: ['caseSize'], equals: caseSize });

    if (attributeFilters.length > 0) {
      where.AND = attributeFilters.map((filter) => ({
        attributes: { path: filter.path, equals: filter.equals },
      }));
    }

    const listings = await prisma.listing.findMany({
      where,
      take: Math.min(300, parseInt(limit, 10) || 200),
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

export async function getFilterOptions(req, res, next) {
  try {
    const { category } = req.query;

    if (!category || category === 'All') {
      return res.status(200).json({ success: true, data: {} });
    }

    const cat = await prisma.category.findFirst({
      where: {
        OR: [
          { displayName: { equals: category, mode: 'insensitive' } },
          { name: { equals: category, mode: 'insensitive' } },
        ],
      },
    });

    if (!cat) {
      return res.status(200).json({ success: true, data: {} });
    }

    // Get all listings for this category to extract unique filter values
    const listings = await prisma.listing.findMany({
      where: { categoryId: cat.id, status: 'AVAILABLE' },
      select: { attributes: true },
    });

    // Extract unique values for each filterable field
    const filterOptions = {};
    const schemaRules = cat.schemaRules || [];

    for (const rule of schemaRules) {
      const field = rule.field;
      const uniqueValues = new Set();

      for (const listing of listings) {
        const attrs = listing.attributes || {};
        const value = attrs[field];
        if (value !== undefined && value !== null && value !== '') {
          uniqueValues.add(String(value));
        }
      }

      if (uniqueValues.size > 0) {
        filterOptions[field] = {
          ...rule,
          options: rule.options
            ? rule.options.filter((opt) => uniqueValues.has(opt))
            : Array.from(uniqueValues).sort(),
        };
      }
    }

    return res.status(200).json({ success: true, data: filterOptions });
  } catch (error) {
    next(error);
  }
}
