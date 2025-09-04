import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { 
  createTestUser, 
  generateTestToken, 
  createTestCategory, 
  createTestProduct, 
  createTestOrder 
} from './helpers.js';

describe('AdminOrdersController', () => {
  describe('GET /admin/orders', () => {
    it('deve listar todos os pedidos para admin', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const customer1 = await createTestUser({
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        password: '123456'
      });

      const customer2 = await createTestUser({
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const product = await createTestProduct({
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Um ótimo smartphone',
        priceCents: 99900,
        stock: 10,
        categoryId: category.id
      });

      // Criar pedidos de diferentes clientes
      await createTestOrder({
        userId: customer1.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      await createTestOrder({
        userId: customer2.id,
        items: [
          {
            productId: product.id,
            quantity: 2,
            priceCents: product.priceCents
          }
        ],
        status: 'CONFIRMED'
      });

      const response = await request(app)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      
      // Verificar se contém pedidos de ambos os clientes
      const userIds = response.body.map((order: any) => order.userId);
      expect(userIds).toContain(customer1.id);
      expect(userIds).toContain(customer2.id);
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/admin/orders')
        .expect(401);
    });

    it('deve retornar lista vazia quando não há pedidos', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      const response = await request(app)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /admin/orders/:id', () => {
    it('deve retornar um pedido específico para admin', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const customer = await createTestUser({
        name: 'Cliente',
        email: 'cliente@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const product = await createTestProduct({
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Um ótimo smartphone',
        priceCents: 99900,
        stock: 10,
        categoryId: category.id
      });

      // Criar pedido
      const order = await createTestOrder({
        userId: customer.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const response = await request(app)
        .get(`/admin/orders/${order.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
      expect(response.body).toHaveProperty('userId', customer.id);
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('totalCents', 99900);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
    });

    it('deve retornar erro 404 para pedido não encontrado', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      await request(app)
        .get('/admin/orders/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .get('/admin/orders/some-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/admin/orders/some-id')
        .expect(401);
    });
  });

  describe('PATCH /admin/orders/:id/status', () => {
    it('deve atualizar status do pedido', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const customer = await createTestUser({
        name: 'Cliente',
        email: 'cliente@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const product = await createTestProduct({
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Um ótimo smartphone',
        priceCents: 99900,
        stock: 10,
        categoryId: category.id
      });

      // Criar pedido
      const order = await createTestOrder({
        userId: customer.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const response = await request(app)
        .patch(`/admin/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
      expect(response.body).toHaveProperty('status', 'CONFIRMED');
    });

    it('deve retornar erro 404 para pedido não encontrado', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      await request(app)
        .patch('/admin/orders/invalid-id/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CONFIRMED' })
        .expect(404);
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .patch('/admin/orders/some-id/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'CONFIRMED' })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .patch('/admin/orders/some-id/status')
        .send({ status: 'CONFIRMED' })
        .expect(401);
    });
  });

  describe('PATCH /admin/orders/:id/delivery', () => {
    it('deve atualizar informações de entrega', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const customer = await createTestUser({
        name: 'Cliente',
        email: 'cliente@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const product = await createTestProduct({
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Um ótimo smartphone',
        priceCents: 99900,
        stock: 10,
        categoryId: category.id
      });

      // Criar pedido
      const order = await createTestOrder({
        userId: customer.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const deliveryData = {
        trackingCode: 'ABC123456',
        estimatedDelivery: '2024-01-15'
      };

      const response = await request(app)
        .patch(`/admin/orders/${order.id}/delivery`)
        .set('Authorization', `Bearer ${token}`)
        .send(deliveryData)
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .patch('/admin/orders/some-id/delivery')
        .set('Authorization', `Bearer ${token}`)
        .send({ trackingCode: 'ABC123' })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .patch('/admin/orders/some-id/delivery')
        .send({ trackingCode: 'ABC123' })
        .expect(401);
    });
  });

  describe('PATCH /admin/orders/:id/payment', () => {
    it('deve atualizar status de pagamento', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const customer = await createTestUser({
        name: 'Cliente',
        email: 'cliente@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const product = await createTestProduct({
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Um ótimo smartphone',
        priceCents: 99900,
        stock: 10,
        categoryId: category.id
      });

      // Criar pedido
      const order = await createTestOrder({
        userId: customer.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const response = await request(app)
        .patch(`/admin/orders/${order.id}/payment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'PAID' })
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .patch('/admin/orders/some-id/payment')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'PAID' })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .patch('/admin/orders/some-id/payment')
        .send({ status: 'PAID' })
        .expect(401);
    });
  });
});