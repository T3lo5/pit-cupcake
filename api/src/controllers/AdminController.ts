import { Request, Response } from 'express';
import { prisma } from '../libs/prisma.js';

export async function dashboard(_req: Request, res: Response) {
  const [byStatus, revenue] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { totalCents: true } })
  ]);

  res.json({
    ordersByStatus: byStatus,
    totalRevenueCents: revenue._sum.totalCents || 0
  });
}

export async function listAllOrders(req: Request, res: Response) {
  // requireAdmin já garantiu role
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true } }
        }
      },
      address: true,
      payment: true
    }
  });
  res.json(orders);
}

