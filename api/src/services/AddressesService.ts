import { prisma } from '../libs/prisma.js';

export function list(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export function create(userId: string, data: any) {
  return prisma.address.create({ data: { ...data, userId } });
}

export async function update(userId: string, id: string, data: any) {
  const addr = await prisma.address.findFirst({ where: { id, userId } });
  if (!addr) throw { statusCode: 404, message: 'Endereço não encontrado' };
  return prisma.address.update({ where: { id }, data });
}

export async function remove(userId: string, id: string) {
  const addr = await prisma.address.findFirst({ where: { id, userId } });
  if (!addr) throw { statusCode: 404, message: 'Endereço não encontrado' };
  await prisma.address.delete({ where: { id } });
}
