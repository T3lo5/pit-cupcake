import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../libs/prisma.js';

describe('ProductsController', () => {
  let categoryId: string;
  let adminToken: string;

  beforeEach(async () => {
    // Criar categoria
    const category = await prisma.category.create({
      data: {
        name: 'Cupcakes',
        slug: 'cupcakes',
        active: true
      }
    });
    categoryId = category.id;

    // Criar admin para testes que precisam de autenticação
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: 'hash',
        role: 'ADMIN'
      }
    });

    // Simular token de admin (você pode ajustar conforme sua implementação)
    const loginResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Admin Test',
        email: 'admintest@example.com',
        password: '123456'
      });
    
    adminToken = loginResponse.body.accessToken;
  });

  describe('GET /products', () => {
    beforeEach(async () => {
      // Criar produtos para teste
      await prisma.product.createMany({
        data: [
          {
            name: 'Cupcake de Chocolate',
            slug: 'cupcake-chocolate',
            description: 'Delicioso cupcake de chocolate',
            priceCents: 500,
            stock: 10,
            active: true,
            categoryId
          },
          {
            name: 'Cupcake de Morango',
            slug: 'cupcake-morango',
            description: 'Cupcake com sabor de morango',
            priceCents: 450,
            stock: 8,
            active: true,
            categoryId
          }
        ]
      });
    });

    it('deve listar produtos com sucesso', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body.items).toHaveLength(2);
    });

    it('deve filtrar produtos por busca', async () => {
      const response = await request(app)
        .get('/products?search=chocolate')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toContain('Chocolate');
    });

    it('deve aplicar paginação', async () => {
      const response = await request(app)
        .get('/products?page=1&limit=1')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBe(2);
      expect(response.body.pages).toBe(2);
    });
  });

  describe('GET /products/:slug', () => {
    let productSlug: string;

    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Cupcake de Chocolate',
          slug: 'cupcake-chocolate',
          description: 'Delicioso cupcake de chocolate',
          priceCents: 500,
          stock: 10,
          active: true,
          categoryId
        }
      });
      productSlug = product.slug;
    });

    it('deve retornar produto por slug', async () => {
      const response = await request(app)
        .get(`/products/${productSlug}`)
        .expect(200);

      expect(response.body.slug).toBe(productSlug);
      expect(response.body.name).toBe('Cupcake de Chocolate');
      expect(response.body).toHaveProperty('category');
    });

    it('deve retornar 404 para slug inexistente', async () => {
      const response = await request(app)
        .get('/products/slug-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Produto não encontrado');
    });
  });

  describe('POST /products', () => {
    it('deve criar produto com sucesso (com autenticação)', async () => {
      const productData = {
        name: 'Cupcake de Baunilha',
        slug: 'cupcake-baunilha',
        description: 'Cupcake sabor baunilha',
        priceCents: 400,
        stock: 12,
        active: true,
        categoryId
      };

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.name).toBe(productData.name);
      expect(response.body.slug).toBe(productData.slug);
      expect(response.body.priceCents).toBe(productData.priceCents);
    });

    it('deve falhar sem autenticação', async () => {
      const productData = {
        name: 'Cupcake de Baunilha',
        slug: 'cupcake-baunilha',
        description: 'Cupcake sabor baunilha',
        priceCents: 400,
        stock: 12,
        active: true,
        categoryId
      };

      await request(app)
        .post('/products')
        .send(productData)
        .expect(401);
    });
  });

  describe('PUT /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Cupcake de Chocolate',
          slug: 'cupcake-chocolate',
          description: 'Delicioso cupcake de chocolate',
          priceCents: 500,
          stock: 10,
          active: true,
          categoryId
        }
      });
      productId = product.id;
    });

    it('deve atualizar produto com sucesso', async () => {
      const updateData = {
        name: 'Cupcake de Chocolate Premium',
        priceCents: 600
      };

      const response = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.priceCents).toBe(updateData.priceCents);
    });

    it('deve falhar sem autenticação', async () => {
      const updateData = {
        name: 'Cupcake de Chocolate Premium'
      };

      await request(app)
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Cupcake de Chocolate',
          slug: 'cupcake-chocolate',
          description: 'Delicioso cupcake de chocolate',
          priceCents: 500,
          stock: 10,
          active: true,
          categoryId
        }
      });
      productId = product.id;
    });

    it('deve remover produto com sucesso', async () => {
      await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const product = await prisma.product.findUnique({ where: { id: productId } });
      expect(product).toBeNull();
    });

    it('deve falhar sem autenticação', async () => {
      await request(app)
        .delete(`/products/${productId}`)
        .expect(401);
    });
  });
});