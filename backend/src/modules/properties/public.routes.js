import { Router } from 'express';
import { getPublicListings, getPublicProperty } from './public.controller.js';

const router = Router();

router.get('/listings', getPublicListings);
router.get('/listings/:id', getPublicProperty);

export default router;
