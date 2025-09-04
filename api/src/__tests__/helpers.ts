import { prisma } from '../libs/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function createTestUser(data: {
  name: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'ADMIN';
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'CUSTOMER'
    }
  });
}

export function generateTestToken(payload: { id: string; role: 'CUSTOMER' | 'ADMIN' }) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '1h'
  });
}

export async function createTestCategory(data: {
  name: string;
  slug: string;
  active?: boolean;
}) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      active: data.active ?? true
    }
  });
}

export async function createTestProduct(data: {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  categoryId: string;
  active?: boolean;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      priceCents: data.priceCents,
      stock: data.stock,
      categoryId: data.categoryId,
      active: data.active ?? true
    }
  });
}

export async function createTestAddress(data: {
  userId: string;
  label?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
}) {
  return prisma.address.create({
    data: {
      userId: data.userId,
      label: data.label || null,
      cep: data.cep,
      street: data.street,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state
    }
  });
}

export async function createTestOrder(data: {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    priceCents: number;
  }>;
  status?: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
}) {
  const totalCents = data.items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  
  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      status: data.status || 'PENDING',
      totalCents,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents
        }))
      }
    },
    include: {
      items: true
    }
  });
  
  return order;
}

export async function cleanDatabase() {
  // Limpar em ordem para evitar problemas de foreign key
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}