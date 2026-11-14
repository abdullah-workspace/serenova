import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { routeRateLimit } from '../middleware/rateLimit.js';
import { contact } from '../validators/appointments.js';
import { create } from '../controllers/contact.controller.js';

const router = Router();
router.post('/', routeRateLimit(60 * 60 * 1000, 5), validate(contact, 'body'), create);
export default router;
