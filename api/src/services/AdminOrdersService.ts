import { prisma } from '../libs/prisma.js';

export async function listAll() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      items: { include: { product: { select: { id: true, name: true, slug: true } } } },
      payment: true,
      delivery: true,
    }
  });
}

export async function getById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      items: { include: { product: { select: { id: true, name: true, slug: true } } } },
      payment: true,
      delivery: true,
    }
  });
}

export async function setOrderStatus(orderId: string, status: 'CRIADO' | 'PAGO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO') {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { payment: true, delivery: true }
  });
}

export async function updateDelivery(orderId: string, data: { method?: 'RETIRADA' | 'ENTREGA'; status?: 'AGUARDANDO' | 'ROTA' | 'ENTREGUE'; tracking?: string }) {
  const existing = await prisma.delivery.findUnique({ where: { orderId } });
  if (!existing) {
    return prisma.delivery.create({
      data: {
        orderId,
        method: data.method || 'ENTREGA',
        status: data.status || 'AGUARDANDO',
        tracking: data.tracking || null
      }
    });
  }
  return prisma.delivery.update({
    where: { orderId },
    data: {
      method: data.method,
      status: data.status,
      tracking: data.tracking
    }
  });
}

export async function setPaymentStatus(orderId: string, status: 'PENDENTE' | 'CONFIRMADO' | 'FALHOU') {
  const existing = await prisma.payment.findUnique({ where: { orderId } });
  if (!existing) throw { statusCode: 404, message: 'Pagamento não encontrado para o pedido' };
  return prisma.payment.update({ where: { orderId }, data: { status, paidAt: status === 'CONFIRMADO' ? new Date() : null } });
}
