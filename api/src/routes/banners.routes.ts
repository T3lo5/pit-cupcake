import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { BannersController } from '../controllers/BannersController.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();
const bannersController = new BannersController();

const bodySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  image: z.string().url('URL da imagem inválida'),
  productId: z.string().min(1).optional(),
  link: z.string().url().optional(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const idSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório').regex(/^c[a-z0-9]{24}$/, 'ID inválido')
});

router.get('/active', bannersController.listActive.bind(bannersController));

router.use(requireAuth);

router.get('/', bannersController.list.bind(bannersController));
router.get('/:id',
  validate({ params: idSchema }),
  bannersController.getById.bind(bannersController)
);
router.post('/',
  validate({ body: bodySchema }),
  bannersController.create.bind(bannersController)
);
router.patch('/:id',
  validate({
    params: idSchema,
    body: bodySchema.partial()
  }),
  bannersController.update.bind(bannersController)
);
router.delete('/:id',
  validate({ params: idSchema }),
  bannersController.delete.bind(bannersController)
);
router.patch('/:id/toggle',
  validate({ params: idSchema }),
  bannersController.toggleActive.bind(bannersController)
);

export default router;
