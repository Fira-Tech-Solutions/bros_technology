import prisma from './config/prisma.js';
import { initializeListingListeners } from './modules/syndication/listeners/telegramListener.js';
import { DEFAULT_CATEGORIES } from './modules/properties/defaultCategories.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

async function seedCategories() {
  try {
    // Upsert all default categories
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {
          displayName: cat.displayName,
          icon: cat.icon,
          schemaRules: cat.schemaRules,
        },
        create: cat,
      });
    }

    // Remove categories not in defaults (wrong data) — skip if they have listings
    const defaultNames = DEFAULT_CATEGORIES.map((c) => c.name);
    const stale = await prisma.category.findMany({
      where: { name: { notIn: defaultNames } },
      include: { _count: { select: { listings: true } } },
    });

    for (const cat of stale) {
      if (cat._count.listings > 0) {
        // Reassign listings to first matching default category
        const fallbackName = cat.name.includes('LAPTOP') ? 'LAPTOPS' : defaultNames[0];
        const fallback = await prisma.category.findUnique({ where: { name: fallbackName } });
        if (fallback) {
          await prisma.listing.updateMany({
            where: { categoryId: cat.id },
            data: { categoryId: fallback.id },
          });
          console.log(`[Seed] Reassigned ${cat._count.listings} listings from "${cat.name}" to "${fallback.name}"`);
        }
      }
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`[Seed] Removed stale category "${cat.name}"`);
    }

    const count = await prisma.category.count();
    console.log(`[Seed] Categories ready (${count} total)`);
  } catch (err) {
    console.error('[Seed] Category seed error:', err.message);
  }
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('[Server] Database connected');

    await seedCategories();

    initializeListingListeners();

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();
