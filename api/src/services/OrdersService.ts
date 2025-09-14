import { prisma } from '../libs/prisma.js';
import { PayStatus, DeliveryStatus, OrderStatus, DeliveryMethod } from '@prisma/client';

const FLOW: OrderStatus[] = [
  OrderStatus.CRIADO,
  OrderStatus.PAGO,
  OrderStatus.EM_PREPARO,
  OrderStatus.SAIU_PARA_ENTREGA,
  OrderStatus.ENTREGUE,
];

type CreateOrderInput = {
  items: { productId: string; quantity: number }[];
  addressId: string;
  provider: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  deliveryMethod?: 'RETIRADA' | 'ENTREGA';
  shippingCents?: number;
  payment?: { provider: 'PIX' | 'CREDIT_CARD' | 'BOLETO'; status?: PayStatus };
};

export async function createOrder(userId: string, body: CreateOrderInput) {
  const {
    items,
    addressId,
    provider: providerFromBody,
    payment,
    deliveryMethod = 'ENTREGA',
    shippingCents = 1000,
  } = body;

  if (!items?.length) throw { statusCode: 400, message: 'Carrinho vazio' };

  if (!addressId) {
    throw { statusCode: 400, message: 'AddressId obrigatório no modelo atual' };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  const validIds = new Set(products.map((p) => p.id));
  const invalid = items.find((i) => !validIds.has(i.productId));
  if (invalid) {
    throw { statusCode: 400, message: `Produto inválido no pedido: ${invalid.productId}` };
  }

  const priceMap = new Map(products.map((p) => [p.id, p.priceCents]));
  const nameMap = new Map(products.map((p) => [p.id, p.name]));

  const subtotalCents = items.reduce((acc, i) => {
    const unit = priceMap.get(i.productId) ?? 0;
    const qty = Math.max(1, Math.floor(Number(i.quantity) || 1));
    return acc + unit * qty;
  }, 0);

  const discountCents = 0;
  const totalCents = subtotalCents + shippingCents - discountCents;

  const finalProvider = payment?.provider ?? providerFromBody;
  const finalPaymentStatus: PayStatus = payment?.status ?? PayStatus.PENDENTE;

  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      status: OrderStatus.CRIADO,
      subtotalCents,
      shippingCents,
      discountCents,
      totalCents,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
          priceCents: priceMap.get(i.productId) ?? 0,
          nameSnap: nameMap.get(i.productId) ?? 'Produto',
        })),
      },
      payment: {
        create: {
          provider: finalProvider,
          status: finalPaymentStatus,
        },
      },
      delivery: {
        create: {
          method: deliveryMethod === 'RETIRADA' ? DeliveryMethod.RETIRADA : DeliveryMethod.ENTREGA,
          status: DeliveryStatus.AGUARDANDO,
        },
      },
    },
    include: { items: true, payment: true, delivery: true, address: true },
  });

  return order;
}

export async function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1 }
            }
          }
        }
      },
      payment: true,
      delivery: true,
      address: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1 }
            }
          }
        }
      },
      payment: true,
      delivery: true,
      address: true
    }
  });
  return order;
}

export async function getOrderTracking(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      delivery: {
        select: {
          method: true,
          status: true,
          tracking: true,
          updatedAt: true
        }
      }
    }
  });

  if (!order) return null;

  return {
    orderId: order.id,
    orderStatus: order.status,
    orderDate: order.createdAt,
    delivery: order.delivery
  };
}

export async function pay(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: { payment: true } });
  if (!order) throw { statusCode: 404, message: 'Pedido não encontrado' };
  if (order.status !== OrderStatus.CRIADO) throw { statusCode: 400, message: 'Pedido não está apto a pagamento' };

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.PAGO,
      payment: { update: { status: PayStatus.CONFIRMADO, paidAt: new Date() } }
    },
    include: { payment: true }
  });

  return { id: updated.id, status: updated.status, payment: updated.payment };
}

export async function advanceStatus(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw { statusCode: 404, message: 'Pedido não encontrado' };
  const idx = FLOW.indexOf(order.status);
  if (idx === -1 || idx === FLOW.length - 1) throw { statusCode: 400, message: 'Fluxo não avançável' };

  const next = FLOW[idx + 1];
  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: next } });
  return { id: updated.id, status: updated.status };
}
