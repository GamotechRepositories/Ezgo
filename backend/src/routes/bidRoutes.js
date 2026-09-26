import express from 'express';
import { placeBid, getProviderBids } from '../controllers/bidController.js';

const router = express.Router();

router.post('/', placeBid);
router.get('/provider/:providerId', getProviderBids);

export default router;
