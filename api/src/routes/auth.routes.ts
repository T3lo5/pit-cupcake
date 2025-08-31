import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';
import * as AuthController from '../controllers/AuthController.js';

const router = Router();

router.post(
  '/register',
  validate({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6)
    })
  }),
  AuthController.register
);

router.post(
  '/login',
  validate({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6)
    })
  }),
  AuthController.login
);

router.post(
  '/refresh',
  validate({
    body: z.object({
      refreshToken: z.string().min(10)
    })
  }),
  AuthController.refresh
);

export default router;
