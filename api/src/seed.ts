import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './libs/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  // admin
  const adminEmail = 'admin@cupcakes.dev';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN'
    }
  });

  // categorias
  const cat1 = await prisma.category.upsert({
    where: { slug: 'classicos' },
    update: {},
    create: { name: 'Clássicos', slug: 'classicos' }
  });
  const cat2 = await prisma.category.upsert({
    where: { slug: 'especiais' },
    update: {},
    create: { name: 'Especiais', slug: 'especiais' }
  });

  // produtos
  const p1 = await prisma.product.upsert({
    where: { slug: 'cupcake-chocolate' },
    update: {},
    create: {
      categoryId: cat1.id,
      name: 'Cupcake de Chocolate',
      slug: 'cupcake-chocolate',
      description: 'Cobertura de ganache.',
      priceCents: 1500,
      stock: 50,
      active: true,
      images: { create: [{ url: 'https://picsum.photos/seed/choc/600/400', alt: 'Chocolate' }] }
    }
  });

  const p2 = await prisma.product.upsert({
    where: { slug: 'cupcake-baunilha' },
    update: {},
    create: {
      categoryId: cat1.id,
      name: 'Cupcake de Baunilha',
      slug: 'cupcake-baunilha',
      description: 'Cobertura de buttercream.',
      priceCents: 1400,
      stock: 40,
      active: true,
      images: { create: [{ url: 'https://picsum.photos/seed/van/600/400', alt: 'Baunilha' }] }
    }
  });

  const p3 = await prisma.product.upsert({
    where: { slug: 'cupcake-red-velvet' },
    update: {},
    create: {
      categoryId: cat2.id,
      name: 'Cupcake Red Velvet',
      slug: 'cupcake-red-velvet',
      description: 'Clássico Red Velvet.',
      priceCents: 1800,
      stock: 30,
      active: true,
      images: { create: [{ url: 'https://picsum.photos/seed/red/600/400', alt: 'Red Velvet' }] }
    }
  });

  console.log('Seed concluído:', { admin: admin.email, products: [p1.slug, p2.slug, p3.slug] });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
