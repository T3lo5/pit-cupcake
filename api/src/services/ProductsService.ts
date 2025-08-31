import { prisma } from '../libs/prisma.js';

export async function list(query: any) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 12);
  const skip = (page - 1) * limit;
  const search = String(query.search ?? '').trim();
  const category = String(query.category ?? '').trim();

  const where: any = { active: true };
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
  if (category) where.categoryId = category;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: true, category: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: { images: true, category: true } });
}

export async function create(input: any) {
  if (input.priceCents < 0) throw { statusCode: 400, message: 'Preço inválido' };
  if (input.stock < 0) throw { statusCode: 400, message: 'Estoque inválido' };
  return prisma.product.create({ data: input });
}

export async function update(id: string, data: any) {
  if (data.priceCents != null && data.priceCents < 0) throw { statusCode: 400, message: 'Preço inválido' };
  if (data.stock != null && data.stock < 0) throw { statusCode: 400, message: 'Estoque inválido' };
  return prisma.product.update({ where: { id }, data });
}

export async function remove(id: string) {
  await prisma.product.delete({ where: { id } });
}
