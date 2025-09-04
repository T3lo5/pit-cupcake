import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../libs/prisma.js';
import { createTestUser, createTestCategory, createTestProduct, generateTestToken } from './helpers.js';

describe('Products Integration Tests', () => {
  let adminUser: any;
  let customerUser: any;
  let adminToken: string;
  let customerToken: string;
  let category: any;

  beforeEach(async () => {
    // Criar usuários de teste
    adminUser = await createTestUser({
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN'
    });

    customerUser = await createTestUser({
      name: 'Customer User',
      email: 'customer@test.com',
      password: '123456',
      role: 'CUSTOMER'
    });

    // Gerar tokens
    adminToken = generateTestToken({ id: adminUser.id, role: 'ADMIN' });
    customerToken = generateTestToken({ id: customerUser.id, role: 'CUSTOMER' });

    // Criar categoria
    category = await createTestCategory({
      name: 'Test Category',
      slug: 'test-category'
    });
  });

  describe('Fluxo completo de produtos', () => {
    it('deve permitir que admin crie, liste, atualize e delete produtos', async () => {
      // 1. Criar produto
      const productData = {
        name: 'Cupcake de Teste',
        slug: 'cupcake-teste',
        description: 'Produto para teste',
        priceCents: 500,
        stock: 10,
        active: true,
        categoryId: category.id
      };

      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      const createdProduct = createResponse.body;
      expect(createdProduct.name).toBe(productData.name);
      expect(createdProduct.slug).toBe(productData.slug);

      // 2. Listar produtos (público)
      const listResponse = await request(app)
        .get('/products')
        .expect(200);

      expect(listResponse.body.items).toHaveLength(1);
      expect(listResponse.body.items[0].id).toBe(createdProduct.id);

      // 3. Buscar produto por slug (público)
      const getResponse = await request(app)
        .get(`/products/${productData.slug}`)
        .expect(200);

      expect(getResponse.body.id).toBe(createdProduct.id);
      expect(getResponse.body.name).toBe(productData.name);

      // 4. Atualizar produto (admin)
      const updateData = {
        name: 'Cupcake de Teste Atualizado',
        priceCents: 600
      };

      const updateResponse = await request(app)
        .put(`/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateData.name);
      expect(updateResponse.body.priceCents).toBe(updateData.priceCents);

      // 5. Verificar que produto foi atualizado
      const updatedGetResponse = await request(app)
        .get(`/products/${productData.slug}`)
        .expect(200);

      expect(updatedGetResponse.body.name).toBe(updateData.name);

      // 6. Deletar produto (admin)
      await request(app)
        .delete(`/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // 7. Verificar que produto foi deletado
      await request(app)
        .get(`/products/${productData.slug}`)
        .expect(404);
    });

    it('deve restringir operações de admin apenas para usuários admin', async () => {
      const productData = {
        name: 'Cupcake de Teste',
        slug: 'cupcake-teste',
        description: 'Produto para teste',
        priceCents: 500,
        stock: 10,
        active: true,
        categoryId: category.id
      };

      // Customer não pode criar produto
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(productData)
        .expect(403);

      // Criar produto como admin primeiro
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      const productId = createResponse.body.id;

      // Customer não pode atualizar produto
      await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Novo nome' })
        .expect(403);

      // Customer não pode deletar produto
      await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('deve validar dados de entrada corretamente', async () => {
      // Preço negativo
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Teste',
          slug: 'produto-teste',
          description: 'Teste',
          priceCents: -100,
          stock: 10,
          categoryId: category.id
        })
        .expect(400);

      // Estoque negativo
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Teste',
          slug: 'produto-teste',
          description: 'Teste',
          priceCents: 500,
          stock: -5,
          categoryId: category.id
        })
        .expect(400);

      // Campos obrigatórios faltando
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produto Teste'
          // Faltam outros campos obrigatórios
        })
        .expect(400);
    });

    it('deve implementar paginação corretamente', async () => {
      // Criar múltiplos produtos
      const products = [];
      for (let i = 1; i <= 15; i++) {
        const product = await createTestProduct({
          name: `Produto ${i}`,
          slug: `produto-${i}`,
          description: `Descrição do produto ${i}`,
          priceCents: 500 + i,
          stock: 10,
          categoryId: category.id
        });
        products.push(product);
      }

      // Primeira página (padrão: 12 itens)
      const page1Response = await request(app)
        .get('/products?page=1&limit=10')
        .expect(200);

      expect(page1Response.body.items).toHaveLength(10);
      expect(page1Response.body.page).toBe(1);
      expect(page1Response.body.total).toBe(15);
      expect(page1Response.body.pages).toBe(2);

      // Segunda página
      const page2Response = await request(app)
        .get('/products?page=2&limit=10')
        .expect(200);

      expect(page2Response.body.items).toHaveLength(5);
      expect(page2Response.body.page).toBe(2);
    });

    it('deve implementar busca por texto corretamente', async () => {
      // Criar produtos com nomes diferentes
      await createTestProduct({
        name: 'Cupcake de Chocolate',
        slug: 'cupcake-chocolate',
        description: 'Delicioso cupcake',
        priceCents: 500,
        stock: 10,
        categoryId: category.id
      });

      await createTestProduct({
        name: 'Cupcake de Morango',
        slug: 'cupcake-morango',
        description: 'Cupcake com morango',
        priceCents: 450,
        stock: 8,
        categoryId: category.id
      });

      await createTestProduct({
        name: 'Bolo de Chocolate',
        slug: 'bolo-chocolate',
        description: 'Bolo grande',
        priceCents: 2000,
        stock: 5,
        categoryId: category.id
      });

      // Buscar por "chocolate"
      const chocolateResponse = await request(app)
        .get('/products?search=chocolate')
        .expect(200);

      expect(chocolateResponse.body.items).toHaveLength(2);
      expect(chocolateResponse.body.items.every((item: any) => 
        item.name.toLowerCase().includes('chocolate') || 
        item.description.toLowerCase().includes('chocolate')
      )).toBe(true);

      // Buscar por "cupcake"
      const cupcakeResponse = await request(app)
        .get('/products?search=cupcake')
        .expect(200);

      expect(cupcakeResponse.body.items).toHaveLength(2);
      expect(cupcakeResponse.body.items.every((item: any) => 
        item.name.toLowerCase().includes('cupcake')
      )).toBe(true);
    });
  });
});