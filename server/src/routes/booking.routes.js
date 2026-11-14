import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { routeRateLimit } from '../middleware/rateLimit.js';
import * as controller from '../controllers/booking.controller.js';
import {
  cancel,
  createAppointment,
  lookup,
  referenceParams,
  reschedule
} from '../validators/appointments.js';
const router = Router();
const hour = 60 * 60 * 1000;

router.post('/', routeRateLimit(hour, 10), validate(createAppointment, 'body'), controller.create);
router.get('/lookup', routeRateLimit(hour, 30), validate(lookup, 'query'), controller.lookup);
router.patch(
  '/:reference/cancel',
  routeRateLimit(hour, 30),
  validate(referenceParams, 'params'),
  validate(cancel, 'body'),
  controller.cancel
);
router.patch(
  '/:reference/reschedule',
  routeRateLimit(hour, 30),
  validate(referenceParams, 'params'),
  validate(reschedule, 'body'),
  controller.reschedule
);
export default router;
