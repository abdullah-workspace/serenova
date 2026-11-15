import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import * as v from '../validators/patient.js';
import * as controller from '../controllers/patient.controller.js';
import { Patient } from '../models/Patient.js';

const router = Router();
router.use(requireAuth, requireRole('patient'), async (req, res, next) => {
  try { req.patient = await Patient.findOne({ userId: req.user._id }); next(); } catch (error) { next(error); }
});
router.get('/profile', controller.profile);
router.patch('/profile', validate(v.profile, 'body'), controller.updateProfile);
router.post('/change-password', validate(v.password, 'body'), controller.changePassword);
router.get('/appointments', validate(v.list, 'query'), controller.list);
router.get('/appointments/:id', validate(v.id, 'params'), controller.get);
router.patch('/appointments/:id/cancel', validate(v.id, 'params'), validate(v.cancel, 'body'), controller.cancel);
router.patch('/appointments/:id/reschedule', validate(v.id, 'params'), validate(v.reschedule, 'body'), controller.reschedule);
router.post('/appointments/claim', validate(v.claim, 'body'), controller.claim);
export default router;
