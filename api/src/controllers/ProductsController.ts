import { Request, Response } from 'express';
import * as ProductsService from '../services/ProductsService.js';

export async function list(req: Request, res: Response) {
  const result = await ProductsService.list(req.query);
  res.json(result);
}

export async function getBySlug(req: Request, res: Response) {
  const result = await ProductsService.getBySlug(req.params.slug);
  if (!result) return res.status(404).json({ message: 'Produto não encontrado' });
  res.json(result);
}

export async function create(req: Request, res: Response) {
  const result = await ProductsService.create(req.body);
  res.status(201).json(result);
}

export async function update(req: Request, res: Response) {
  const result = await ProductsService.update(req.params.id, req.body);
  res.json(result);
}

export async function remove(req: Request, res: Response) {
  await ProductsService.remove(req.params.id);
  res.status(204).send();
}
