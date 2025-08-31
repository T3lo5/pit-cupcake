import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import * as AdminController from '../controllers/AdminController.js';
import { listAllOrders } from '../controllers/AdminController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', AdminController.dashboard);
router.get('/orders', AdminController.listAllOrders)

export default router;
