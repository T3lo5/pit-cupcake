import { Request, Response } from 'express';
import * as AdminProductsService from '../services/AdminProductsService.js';
import { toCents, toInt, normStr, normNullableStr, slugify } from '../utils/normalizers.js';

export async function list(_req: Request, res: Response) {
  const products = await AdminProductsService.listProducts();
  res.json(products);
}

export async function create(req: Request, res: Response) {
  const body = req.body ?? {};

  const categoryId = normStr(body.categoryId);
  const name = normStr(body.name);
  const rawSlug = normStr(body.slug);
  const slug = rawSlug ? slugify(rawSlug) : slugify(name);
  const description = normNullableStr(body.description);

  const priceCents = toCents(body.price ?? body.priceCents ?? '0');

  const stock = toInt(body.stock);
  const active = Boolean(body.active ?? true);

  const imagesInput = Array.isArray(body.images) ? body.images : [];
  const images = imagesInput
    .map((i: any) => {
      const url = normStr(i?.url);
      const alt = normNullableStr(i?.alt);
      return url ? { url, alt } : null;
    })
    .filter(Boolean) as { url: string; alt?: string | null }[];

  if (!categoryId) return res.status(400).json({ message: 'Categoria obrigatória' });
  if (!name) return res.status(400).json({ message: 'Nome obrigatório' });
  if (!slug) return res.status(400).json({ message: 'Slug inválido' });

  try {
    const created = await AdminProductsService.createProduct({
      categoryId,
      name,
      slug,
      description,
      priceCents,
      stock,
      active,
      images,
    });
    return res.status(201).json(created);
  } catch (e: any) {
    const msg = e?.message || 'Erro ao criar produto';
    const status = e?.statusCode || 400;
    return res.status(status).json({ message: msg });
  }
}

export async function update(req: Request, res: Response) {
  const id = normStr(req.params.id);
  const body = req.body ?? {};

  const updateData: any = {};

  if (body.categoryId !== undefined) updateData.categoryId = normStr(body.categoryId);
  if (body.name !== undefined) updateData.name = normStr(body.name);
  if (body.slug !== undefined) {
    const rawSlug = normStr(body.slug);
    updateData.slug = rawSlug ? slugify(rawSlug) : undefined;
  }
  if (body.description !== undefined) updateData.description = normNullableStr(body.description);

  if (body.price !== undefined || body.priceCents !== undefined) {
    updateData.priceCents = toCents(body.price ?? body.priceCents ?? '0');
  }

  if (body.stock !== undefined) updateData.stock = toInt(body.stock);
  if (body.active !== undefined) updateData.active = Boolean(body.active);

  if (body.images !== undefined) {
    const imagesInput = Array.isArray(body.images) ? body.images : [];
    updateData.images = imagesInput
      .map((i: any) => {
        const url = normStr(i?.url);
        const alt = normNullableStr(i?.alt);
        return url ? { url, alt } : null;
      })
      .filter(Boolean);
  }

  try {
    const updated = await AdminProductsService.updateProduct(id, updateData);
    return res.json(updated);
  } catch (e: any) {
    const msg = e?.message || 'Erro ao atualizar produto';
    const status = e?.statusCode || 400;
    return res.status(status).json({ message: msg });
  }
}

export async function toggle(req: Request, res: Response) {
  const id = normStr(req.params.id);
  const active = Boolean(req.body?.active);
  try {
    const updated = await AdminProductsService.toggleActive(id, active);
    return res.json(updated);
  } catch (e: any) {
    const msg = e?.message || 'Erro ao alterar status';
    const status = e?.statusCode || 400;
    return res.status(status).json({ message: msg });
  }
}
