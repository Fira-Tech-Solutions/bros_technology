import { Router } from 'express';
import { authenticate, authorize } from '../users/auth.middleware.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

const router = Router();

// Public: anyone can read categories (public website needs this)
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin-only: write operations require authentication
router.post('/', authenticate(), authorize('SUPER_ADMIN'), createCategory);
router.patch('/:id', authenticate(), authorize('SUPER_ADMIN'), updateCategory);
router.delete('/:id', authenticate(), authorize('SUPER_ADMIN'), deleteCategory);

export default router;
