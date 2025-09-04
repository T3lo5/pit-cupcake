import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '../libs/prisma';

// Setup do banco de dados de teste
beforeAll(async () => {
  // Configurar variáveis de ambiente para teste
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_ACCESS_EXPIRES = '15m';
  process.env.JWT_REFRESH_EXPIRES = '7d';
});

// Limpar dados entre testes
beforeEach(async () => {
  // Limpar tabelas em ordem para evitar problemas de foreign key
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

// Fechar conexão após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});