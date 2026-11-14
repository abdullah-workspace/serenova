import { Router } from 'express';
import { availabilityToday } from '../controllers/booking.controller.js';
const router = Router();
router.get('/today', availabilityToday);
export default router;
