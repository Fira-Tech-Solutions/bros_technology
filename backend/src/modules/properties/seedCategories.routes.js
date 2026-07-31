import { Router } from 'express';
import prisma from '../../config/prisma.js';
import { authenticate, authorize } from '../users/auth.middleware.js';
import { DEFAULT_CATEGORIES } from './defaultCategories.js';

const router = Router();

router.get('/', authenticate(), authorize('SUPER_ADMIN'), async (_req, res) => {
  try {
    let created = 0;
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await prisma.category.findUnique({ where: { name: cat.name } });
      if (!existing) {
        await prisma.category.create({ data: cat });
        created++;
      }
    }
    const all = await prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json({ success: true, created, data: all });
  } catch (err) {
    console.error('[SeedCategories] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to seed categories' });
  }
});

export default router;
