import { Router } from 'express';
import { authenticate, authorize } from '../users/auth.middleware.js';
import { getCommissionSummary, getCommissionListings, updateListingCommission, getAssetStats } from './commission.controller.js';

const router = Router();

router.use(authenticate(), authorize('SUPER_ADMIN'));

router.get('/asset-stats', getAssetStats);
router.get('/summary', getCommissionSummary);
router.get('/listings', getCommissionListings);
router.patch('/listing/:id', updateListingCommission);

export default router;
