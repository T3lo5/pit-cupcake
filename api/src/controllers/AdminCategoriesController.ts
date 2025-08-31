import { Request, Response } from 'express';
import * as S from '../services/CategoriesService.js';

export async function list(_req: Request, res: Response) {
  const cats = await S.listCategories();
  res.json(cats);
}

export async function create(req: Request, res: Response) {
  try {
    const created = await S.createCategory({ name: req.body?.name, slug: req.body?.slug });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(e?.statusCode || 400).json({ message: e?.message || 'Erro ao criar categoria' });
  }
}
