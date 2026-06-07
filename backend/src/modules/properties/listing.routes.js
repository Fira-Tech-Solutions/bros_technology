import { Router } from 'express';
import { processImages, optimizeImages } from '../../utils/imageProcessor.js';
import { validateListingAttributes } from './dynamic.validation.js';
import { authenticate, authorize } from '../users/auth.middleware.js';
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
} from './listing.controller.js';

const router = Router();

router.get('/', getListings);
router.get('/:id', getListingById);

const protectedWriteMiddleware = [
  authenticate(),
  processImages,
  optimizeImages,
  validateListingAttributes(),
];

router.post('/', ...protectedWriteMiddleware, createListing);
router.patch('/:id', ...protectedWriteMiddleware, updateListing);

export default router;
