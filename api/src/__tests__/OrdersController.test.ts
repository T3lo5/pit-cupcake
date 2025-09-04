import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { 
  createTestUser, 
  generateTestToken, 
  createTestCategory, 
  createTestProduct, 
  createTestAddress,
  createTestOrder 
} from './helpers.js';

describe('OrdersController', () => {
  describe('POST /orders', () => {
    it('deve criar um novo pedido com sucesso', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

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

      // Criar endereço
      const address = await createTestAddress({
        userId: user.id,
        label: 'Casa',
        cep: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      });

      const orderData = {
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 2
          }
        ],
        payment: {
          provider: 'PIX'
        }
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('totalCents', 199800); // 2 * 99900
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toHaveProperty('productId', product.id);
      expect(response.body.items[0]).toHaveProperty('quantity', 2);
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Faltando campos obrigatórios
          items: []
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .post('/orders')
        .send({
          addressId: 'some-id',
          items: [{ productId: 'some-id', quantity: 1 }],
          payment: { provider: 'PIX' }
        })
        .expect(401);
    });
  });

  describe('GET /orders', () => {
    it('deve listar pedidos do usuário autenticado', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

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
      await createTestOrder({
        userId: user.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('status', 'PENDING');
      expect(response.body[0]).toHaveProperty('totalCents', 99900);
    });

    it('deve retornar lista vazia para usuário sem pedidos', async () => {
      const user = await createTestUser({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/orders')
        .expect(401);
    });
  });

  describe('GET /orders/:id', () => {
    it('deve retornar um pedido específico do usuário', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

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
        userId: user.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const response = await request(app)
        .get(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('totalCents', 99900);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
    });

    it('deve retornar erro 404 para pedido não encontrado', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .get('/orders/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/orders/some-id')
        .expect(401);
    });
  });

  describe('POST /orders/:id/pay', () => {
    it('deve processar pagamento de um pedido', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

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
        userId: user.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            priceCents: product.priceCents
          }
        ]
      });

      const response = await request(app)
        .post(`/orders/${order.id}/pay`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('deve retornar erro 404 para pedido não encontrado', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .post('/orders/invalid-id/pay')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .post('/orders/some-id/pay')
        .expect(401);
    });
  });

  describe('POST /orders/:id/advance', () => {
    it('deve avançar status do pedido (apenas admin)', async () => {
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

      const adminToken = generateTestToken({ id: admin.id, role: admin.role });

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
        .post(`/orders/${order.id}/advance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
      expect(response.body).toHaveProperty('status'); // Status deve ter mudado
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .post('/orders/some-id/advance')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .post('/orders/some-id/advance')
        .expect(401);
    });
  });
});