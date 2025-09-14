import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import * as OrdersController from '../controllers/OrdersController.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate({
    body: z.object({
      addressId: z.string(),
      items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
      payment: z.object({ provider: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO']) })
    })
  }),
  OrdersController.create
);

router.get('/', OrdersController.listMine);
router.get('/:id', OrdersController.getOne);

router.post('/:id/pay', OrdersController.pay);

router.post('/:id/advance', requireAdmin, OrdersController.advanceStatus);

router.get('/:id/tracking', OrdersController.getTracking);

export default router;
