import { prisma } from '../libs/prisma.js';

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, images: true }
  });
}

export async function createProduct(input: {
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  stock?: number;
  active?: boolean;
  images?: { url: string; alt?: string | null }[];
}) {
  const exists = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (exists) throw { statusCode: 400, message: 'Slug já existe' };
  return prisma.product.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      priceCents: Number(input.priceCents) || 0,
      stock: input.stock ?? 0,
      active: input.active ?? true,
      images: input.images?.length ? {
        create: input.images.map((i) => ({ url: i.url, alt: i.alt ?? null }))
      } : undefined
    },
    include: { category: true, images: true }
  });
}

export async function updateProduct(id: string, input: Partial<{
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  stock: number;
  active: boolean;
  images: { url: string; alt?: string | null }[];
}>) {
  const data: any = { ...input };
  if (data.priceCents != null) data.priceCents = Number(data.priceCents) || 0;

  let imagesOp;
  if (input.images) {
    imagesOp = {
      deleteMany: { productId: id },
      create: input.images.map((i) => ({ url: i.url, alt: i.alt ?? null }))
    };
  }

  return prisma.product.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? undefined,
      priceCents: data.priceCents,
      stock: data.stock,
      active: data.active,
      images: imagesOp ? imagesOp : undefined
    },
    include: { category: true, images: true }
  });
}

export async function toggleActive(id: string, active: boolean) {
  return prisma.product.update({
    where: { id },
    data: { active },
    include: { category: true, images: true }
  });
}
