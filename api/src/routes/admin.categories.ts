import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import * as C from '../controllers/AdminCategoriesController.js';

const r = Router();
r.use(requireAdmin);

r.get('/categories', C.list);
r.post('/categories', C.create);

export default r;
