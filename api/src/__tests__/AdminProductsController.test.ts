import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { 
  createTestUser, 
  generateTestToken, 
  createTestCategory, 
  createTestProduct 
} from './helpers.js';

describe('AdminProductsController', () => {
  describe('GET /admin/products', () => {
    it('deve listar todos os produtos (incluindo inativos) para admin', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      // Criar produtos ativos e inativos
      await createTestProduct({
        name: 'Produto Ativo',
        slug: 'produto-ativo',
        description: 'Descrição do produto ativo',
        priceCents: 10000,
        stock: 5,
        categoryId: category.id,
        active: true
      });

      await createTestProduct({
        name: 'Produto Inativo',
        slug: 'produto-inativo',
        description: 'Descrição do produto inativo',
        priceCents: 20000,
        stock: 0,
        categoryId: category.id,
        active: false
      });

      const response = await request(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2); // Deve incluir ativos e inativos
      
      const productNames = response.body.map((product: any) => product.name);
      expect(productNames).toContain('Produto Ativo');
      expect(productNames).toContain('Produto Inativo');
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/admin/products')
        .expect(401);
    });

    it('deve retornar lista vazia quando não há produtos', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      const response = await request(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /admin/products', () => {
    it('deve criar um novo produto com sucesso', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const productData = {
        categoryId: category.id,
        name: 'Novo Produto',
        slug: 'novo-produto',
        description: 'Descrição do novo produto',
        price: '199.99',
        stock: 10,
        active: true,
        images: [
          { url: 'https://example.com/image1.jpg', alt: 'Imagem 1' },
          { url: 'https://example.com/image2.jpg', alt: 'Imagem 2' }
        ]
      };

      const response = await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', productData.name);
      expect(response.body).toHaveProperty('slug', productData.slug);
      expect(response.body).toHaveProperty('description', productData.description);
      expect(response.body).toHaveProperty('priceCents', 19999);
      expect(response.body).toHaveProperty('stock', productData.stock);
      expect(response.body).toHaveProperty('active', productData.active);
      expect(response.body).toHaveProperty('categoryId', category.id);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('deve criar produto com slug gerado automaticamente', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const productData = {
        categoryId: category.id,
        name: 'Produto Sem Slug',
        description: 'Descrição do produto',
        price: '99.99',
        stock: 5
      };

      const response = await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('slug', 'produto-sem-slug');
    });

    it('deve retornar erro 400 para categoria obrigatória', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      const response = await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Produto Sem Categoria',
          price: '99.99',
          stock: 5
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Categoria obrigatória');
    });

    it('deve retornar erro 400 para nome obrigatório', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      const response = await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId: category.id,
          price: '99.99',
          stock: 5
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Nome obrigatório');
    });

    it('deve retornar erro 400 para slug duplicado', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      // Criar produto primeiro
      await createTestProduct({
        name: 'Produto Existente',
        slug: 'produto-existente',
        description: 'Descrição',
        priceCents: 10000,
        stock: 5,
        categoryId: category.id
      });

      // Tentar criar com mesmo slug
      const response = await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId: category.id,
          name: 'Outro Produto',
          slug: 'produto-existente',
          price: '99.99',
          stock: 5
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Novo Produto',
          price: '99.99',
          stock: 5
        })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .post('/admin/products')
        .send({
          name: 'Novo Produto',
          price: '99.99',
          stock: 5
        })
        .expect(401);
    });
  });

  describe('PATCH /admin/products/:id', () => {
    it('deve atualizar um produto existente', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      // Criar produto
      const product = await createTestProduct({
        name: 'Produto Original',
        slug: 'produto-original',
        description: 'Descrição original',
        priceCents: 10000,
        stock: 5,
        categoryId: category.id
      });

      const updateData = {
        name: 'Produto Atualizado',
        price: '299.99',
        stock: 15,
        description: 'Nova descrição'
      };

      const response = await request(app)
        .patch(`/admin/products/${product.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Produto Atualizado');
      expect(response.body).toHaveProperty('priceCents', 29999);
      expect(response.body).toHaveProperty('stock', 15);
      expect(response.body).toHaveProperty('description', 'Nova descrição');
      expect(response.body).toHaveProperty('slug', 'produto-original'); // Slug não alterado
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      // Criar produto
      const product = await createTestProduct({
        name: 'Produto Original',
        slug: 'produto-original',
        description: 'Descrição original',
        priceCents: 10000,
        stock: 5,
        categoryId: category.id
      });

      const updateData = {
        stock: 20 // Apenas stock
      };

      const response = await request(app)
        .patch(`/admin/products/${product.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('stock', 20);
      expect(response.body).toHaveProperty('name', 'Produto Original'); // Não alterado
      expect(response.body).toHaveProperty('priceCents', 10000); // Não alterado
    });

    it('deve retornar erro 404 para produto não encontrado', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      await request(app)
        .patch('/admin/products/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Novo Nome' })
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
        .patch('/admin/products/some-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Novo Nome' })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .patch('/admin/products/some-id')
        .send({ name: 'Novo Nome' })
        .expect(401);
    });
  });

  describe('PATCH /admin/products/:id/toggle', () => {
    it('deve alternar status ativo/inativo do produto', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const category = await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos'
      });

      // Criar produto ativo
      const product = await createTestProduct({
        name: 'Produto Ativo',
        slug: 'produto-ativo',
        description: 'Descrição',
        priceCents: 10000,
        stock: 5,
        categoryId: category.id,
        active: true
      });

      // Desativar produto
      const response = await request(app)
        .patch(`/admin/products/${product.id}/toggle`)
        .set('Authorization', `Bearer ${token}`)
        .send({ active: false })
        .expect(200);

      expect(response.body).toHaveProperty('active', false);
    });

    it('deve retornar erro 404 para produto não encontrado', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      await request(app)
        .patch('/admin/products/invalid-id/toggle')
        .set('Authorization', `Bearer ${token}`)
        .send({ active: false })
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
        .patch('/admin/products/some-id/toggle')
        .set('Authorization', `Bearer ${token}`)
        .send({ active: false })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .patch('/admin/products/some-id/toggle')
        .send({ active: false })
        .expect(401);
    });
  });
});