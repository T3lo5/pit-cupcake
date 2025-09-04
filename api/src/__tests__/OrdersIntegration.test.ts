import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { 
  createTestUser, 
  generateTestToken, 
  createTestCategory, 
  createTestProduct, 
  createTestAddress 
} from './helpers.js';

describe('Orders Integration Tests', () => {
  describe('Complete Order Flow', () => {
    it('deve permitir fluxo completo: criar pedido, pagar e admin gerenciar', async () => {
      // Criar usuários
      const customer = await createTestUser({
        name: 'Cliente Teste',
        email: 'cliente@example.com',
        password: '123456'
      });

      const admin = await createTestUser({
        name: 'Admin Teste',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const customerToken = generateTestToken({ id: customer.id, role: customer.role });
      const adminToken = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const product = await createTestProduct({
        name: 'Smartphone Premium',
        slug: 'smartphone-premium',
        description: 'Um excelente smartphone',
        priceCents: 199900,
        stock: 10,
        categoryId: category.id
      });

      // Criar endereço do cliente
      const address = await createTestAddress({
        userId: customer.id,
        label: 'Casa',
        cep: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      });

      // 1. Cliente cria pedido
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

      const createOrderResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createOrderResponse.body.id;
      expect(createOrderResponse.body).toHaveProperty('status', 'PENDING');
      expect(createOrderResponse.body).toHaveProperty('totalCents', 399800); // 2 * 199900

      // 2. Cliente visualiza seus pedidos
      const listOrdersResponse = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(listOrdersResponse.body).toHaveLength(1);
      expect(listOrdersResponse.body[0]).toHaveProperty('id', orderId);

      // 3. Cliente visualiza pedido específico
      const getOrderResponse = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(getOrderResponse.body).toHaveProperty('id', orderId);
      expect(getOrderResponse.body).toHaveProperty('items');
      expect(getOrderResponse.body.items).toHaveLength(1);

      // 4. Cliente paga o pedido
      const payOrderResponse = await request(app)
        .post(`/orders/${orderId}/pay`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(payOrderResponse.body).toHaveProperty('success', true);

      // 5. Admin visualiza todos os pedidos
      const adminListOrdersResponse = await request(app)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminListOrdersResponse.body).toHaveLength(1);
      expect(adminListOrdersResponse.body[0]).toHaveProperty('id', orderId);

      // 6. Admin visualiza pedido específico
      const adminGetOrderResponse = await request(app)
        .get(`/admin/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminGetOrderResponse.body).toHaveProperty('id', orderId);

      // 7. Admin atualiza status do pedido
      const updateStatusResponse = await request(app)
        .patch(`/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(updateStatusResponse.body).toHaveProperty('status', 'CONFIRMED');

      // 8. Admin atualiza informações de entrega
      const updateDeliveryResponse = await request(app)
        .patch(`/admin/orders/${orderId}/delivery`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          trackingCode: 'BR123456789',
          estimatedDelivery: '2024-01-15'
        })
        .expect(200);

      expect(updateDeliveryResponse.body).toHaveProperty('id', orderId);

      // 9. Admin atualiza status de pagamento
      const updatePaymentResponse = await request(app)
        .patch(`/admin/orders/${orderId}/payment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' })
        .expect(200);

      expect(updatePaymentResponse.body).toHaveProperty('id', orderId);

      // 10. Verificar que o estoque foi reduzido
      const adminProductsResponse = await request(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const updatedProduct = adminProductsResponse.body.find((p: any) => p.id === product.id);
      expect(updatedProduct).toHaveProperty('stock', 8); // 10 - 2 = 8
    });

    it('deve impedir pedido com produto sem estoque suficiente', async () => {
      const customer = await createTestUser({
        name: 'Cliente Teste',
        email: 'cliente2@example.com',
        password: '123456'
      });

      const customerToken = generateTestToken({ id: customer.id, role: customer.role });

      // Criar categoria e produto com pouco estoque
      const category = await createTestCategory({
        name: 'Livros',
        slug: 'livros'
      });

      const product = await createTestProduct({
        name: 'Livro Raro',
        slug: 'livro-raro',
        description: 'Um livro muito raro',
        priceCents: 5000,
        stock: 1, // Apenas 1 em estoque
        categoryId: category.id
      });

      // Criar endereço do cliente
      const address = await createTestAddress({
        userId: customer.id,
        label: 'Casa',
        cep: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      });

      // Tentar criar pedido com quantidade maior que o estoque
      const orderData = {
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 5 // Mais que o estoque disponível
          }
        ],
        payment: {
          provider: 'PIX'
        }
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('estoque');
    });

    it('deve impedir pedido com endereço de outro usuário', async () => {
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

      const customer1Token = generateTestToken({ id: customer1.id, role: customer1.role });

      // Criar categoria e produto
      const category = await createTestCategory({
        name: 'Roupas',
        slug: 'roupas'
      });

      const product = await createTestProduct({
        name: 'Camiseta',
        slug: 'camiseta',
        description: 'Uma camiseta legal',
        priceCents: 2999,
        stock: 10,
        categoryId: category.id
      });

      // Criar endereço do cliente 2
      const address = await createTestAddress({
        userId: customer2.id, // Endereço pertence ao cliente 2
        label: 'Casa',
        cep: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      });

      // Cliente 1 tenta usar endereço do cliente 2
      const orderData = {
        addressId: address.id,
        items: [
          {
            productId: product.id,
            quantity: 1
          }
        ],
        payment: {
          provider: 'PIX'
        }
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send(orderData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});