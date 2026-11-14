import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/departments.controller.js';
const router = Router();
router.get('/', asyncHandler(controller.list));
router.get('/:slug', asyncHandler(controller.get));
export default router;
