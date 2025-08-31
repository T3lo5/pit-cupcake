import { Request, Response } from 'express';
import * as S from '../services/CategoriesService.js';

export async function list(_req: Request, res: Response) {
  const cats = await S.listCategories();
  res.json(cats);
}
