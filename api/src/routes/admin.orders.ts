import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import * as C from '../controllers/AdminOrdersController.js';

const r = Router();
r.use(requireAdmin);
r.get('/orders', C.list);
r.get('/orders/:id', C.getOne);
r.patch('/orders/:id/status', C.setStatus);
r.patch('/orders/:id/delivery', C.updateDelivery);
r.patch('/orders/:id/payment', C.setPaymentStatus);
export default r;
