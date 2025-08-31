import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import * as C from '../controllers/AdminProductsController.js';

const r = Router();
r.use(requireAdmin);

r.get('/products', C.list);
r.post('/products', C.create);
r.patch('/products/:id', C.update);
r.patch('/products/:id/active', C.toggle);

export default r;
