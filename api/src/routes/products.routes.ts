import { Router } from 'express';
import * as ProductsController from '../controllers/ProductsController.js';
import { requireAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

router.get('/', ProductsController.list);
router.get('/:slug', ProductsController.getBySlug);

router.post(
  '/',
  requireAdmin,
  validate({
    body: z.object({
      categoryId: z.string(),
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().optional(),
      priceCents: z.number().int().nonnegative(),
      stock: z.number().int().nonnegative().default(0),
      active: z.boolean().default(true)
    })
  }),
  ProductsController.create
);

router.patch(
  '/:id',
  requireAdmin,
  validate({
    params: z.object({ id: z.string() }),
    body: z.object({
      categoryId: z.string().optional(),
      name: z.string().min(2).optional(),
      slug: z.string().min(2).optional(),
      description: z.string().optional(),
      priceCents: z.number().int().nonnegative().optional(),
      stock: z.number().int().nonnegative().optional(),
      active: z.boolean().optional()
    })
  }),
  ProductsController.update
);

router.delete('/:id', requireAdmin, ProductsController.remove);

export default router;
