import prisma from '../../config/prisma.js';

export async function getAllCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: categories.map((c) => ({
        ...c,
        listingCount: c._count.listings,
        _count: undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: `Category with id "${id}" not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...category,
        listingCount: category._count.listings,
        _count: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, displayName, icon, schemaRules } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Fields "name" and "displayName" are required',
      });
    }

    if (schemaRules && !Array.isArray(schemaRules)) {
      return res.status(400).json({
        success: false,
        error: '"schemaRules" must be an array of field rule objects',
      });
    }

    if (schemaRules) {
      for (const rule of schemaRules) {
        if (!rule.field || !rule.type) {
          return res.status(400).json({
            success: false,
            error: `Each schema rule must contain "field" and "type". Received: ${JSON.stringify(rule)}`,
          });
        }
      }
    }

    const category = await prisma.category.create({
      data: {
        name: name.toUpperCase().trim(),
        displayName: displayName.trim(),
        icon: icon || 'tag',
        schemaRules: schemaRules || [],
      },
    });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: `Category "${req.body.name}" already exists`,
      });
    }
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, displayName, icon, schemaRules } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Category with id "${id}" not found`,
      });
    }

    if (schemaRules && !Array.isArray(schemaRules)) {
      return res.status(400).json({
        success: false,
        error: '"schemaRules" must be an array of field rule objects',
      });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.toUpperCase().trim() }),
        ...(displayName && { displayName: displayName.trim() }),
        ...(icon && { icon }),
        ...(schemaRules && { schemaRules }),
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: `Category "${req.body.name}" already exists`,
      });
    }
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { listings: true } } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Category with id "${id}" not found`,
      });
    }

    if (existing._count.listings > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete category "${existing.displayName}" — it has ${existing._count.listings} listing(s). Reassign or remove them first.`,
      });
    }

    await prisma.category.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    next(error);
  }
}
