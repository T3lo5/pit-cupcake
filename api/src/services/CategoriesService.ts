import { prisma } from '../libs/prisma.js';

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(input: { name: string; slug?: string }) {
  const rawName = String(input.name ?? '').trim();
  if (!rawName) throw { statusCode: 400, message: 'Nome obrigatório' };

  const slugBase = (input.slug ?? rawName).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const exists = await prisma.category.findUnique({ where: { slug: slugBase } });
  if (exists) throw { statusCode: 400, message: 'Slug de categoria já existe' };

  return prisma.category.create({ data: { name: rawName, slug: slugBase } });
}
