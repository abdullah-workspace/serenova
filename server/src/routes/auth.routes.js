import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as v from '../validators/auth.js';
import * as controller from '../controllers/auth.controller.js';
import { routeRateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.post('/register', routeRateLimit(60 * 60 * 1000, 5), validate(v.register, 'body'), controller.register);
router.post('/login', routeRateLimit(15 * 60 * 1000, 10), validate(v.login, 'body'), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);
router.post('/forgot-password', routeRateLimit(60 * 60 * 1000, 5), validate(v.forgotPassword, 'body'), controller.forgotPassword);
router.post('/reset-password', routeRateLimit(60 * 60 * 1000, 10), validate(v.resetPassword, 'body'), controller.resetPassword);
export default router;
