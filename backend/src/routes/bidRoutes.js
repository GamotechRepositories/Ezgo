import express from 'express';
import { placeBid, getProviderBids } from '../controllers/bidController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', placeBid);
router.get('/provider/:providerId', getProviderBids);

export default router;
