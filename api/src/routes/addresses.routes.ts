import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as AddressesController from '../controllers/AddressesController.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const bodySchema = z.object({
  label: z.string().optional(),
  cep: z.string().min(5),
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  city: z.string(),
  state: z.string()
});

router.get('/', AddressesController.list);
router.post('/', validate({ body: bodySchema }), AddressesController.create);
router.patch('/:id', validate({ params: z.object({ id: z.string() }), body: bodySchema.partial() }), AddressesController.update);
router.delete('/:id', AddressesController.remove);

export default router;
