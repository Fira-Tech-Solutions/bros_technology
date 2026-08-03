import { Router } from 'express';
import { processImages, optimizeImages } from '../../utils/imageProcessor.js';
import { validateListingAttributes } from './dynamic.validation.js';
import { authenticate, authorize } from '../users/auth.middleware.js';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from './listing.controller.js';

const router = Router();

router.get('/', authenticate(), getListings);
router.get('/:id', authenticate(), getListingById);

const protectedWriteMiddleware = [
  authenticate(),
  processImages,
  optimizeImages,
  validateListingAttributes(),
];

router.post('/', ...protectedWriteMiddleware, createListing);
router.patch('/:id', ...protectedWriteMiddleware, updateListing);
router.delete('/:id', authenticate(), deleteListing);

export default router;
