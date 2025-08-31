import { Router } from 'express';
import * as C from '../controllers/CategoriesController.js';

const r = Router();

r.get('/categories', C.list);

export default r;
