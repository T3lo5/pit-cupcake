import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { createTestUser, generateTestToken } from './helpers.js';

describe('Products and Categories Integration Tests', () => {
  describe('Complete Product Management Flow', () => {
    it('deve permitir fluxo completo de gerenciamento de produtos e categorias', async () => {
      // Criar admin
      const admin = await createTestUser({
        name: 'Admin Teste',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const adminToken = generateTestToken({ id: admin.id, role: admin.role });

      // 1. Admin cria categoria
      const categoryData = {
        name: 'Eletrônicos Premium',
        slug: 'eletronicos-premium'
      };

      const createCategoryResponse = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      const categoryId = createCategoryResponse.body.id;
      expect(createCategoryResponse.body).toHaveProperty('name', categoryData.name);
      expect(createCategoryResponse.body).toHaveProperty('slug', categoryData.slug);
      expect(createCategoryResponse.body).toHaveProperty('active', true);

      // 2. Admin lista categorias (deve incluir a nova)
      const adminListCategoriesResponse = await request(app)
        .get('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminListCategoriesResponse.body).toHaveLength(1);
      expect(adminListCategoriesResponse.body[0]).toHaveProperty('id', categoryId);

      // 3. Usuário público lista categorias (deve incluir apenas ativas)
      const publicListCategoriesResponse = await request(app)
        .get('/categories')
        .expect(200);

      expect(publicListCategoriesResponse.body).toHaveLength(1);
      expect(publicListCategoriesResponse.body[0]).toHaveProperty('id', categoryId);

      // 4. Admin cria produto na categoria
      const productData = {
        categoryId: categoryId,
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'O mais avançado iPhone já criado',
        price: '1299.99',
        stock: 50,
        active: true,
        images: [
          { url: 'https://example.com/iphone1.jpg', alt: 'iPhone frente' },
          { url: 'https://example.com/iphone2.jpg', alt: 'iPhone verso' }
        ]
      };

      const createProductResponse = await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      const productId = createProductResponse.body.id;
      expect(createProductResponse.body).toHaveProperty('name', productData.name);
      expect(createProductResponse.body).toHaveProperty('slug', productData.slug);
      expect(createProductResponse.body).toHaveProperty('priceCents', 129999);
      expect(createProductResponse.body).toHaveProperty('stock', 50);
      expect(createProductResponse.body).toHaveProperty('categoryId', categoryId);

      // 5. Admin lista produtos (deve incluir o novo)
      const adminListProductsResponse = await request(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminListProductsResponse.body).toHaveLength(1);
      expect(adminListProductsResponse.body[0]).toHaveProperty('id', productId);

      // 6. Usuário público lista produtos (deve incluir apenas ativos)
      const publicListProductsResponse = await request(app)
        .get('/products')
        .expect(200);

      expect(publicListProductsResponse.body).toHaveLength(1);
      expect(publicListProductsResponse.body[0]).toHaveProperty('id', productId);

      // 7. Usuário público busca produto por slug
      const getProductBySlugResponse = await request(app)
        .get(`/products/${productData.slug}`)
        .expect(200);

      expect(getProductBySlugResponse.body).toHaveProperty('id', productId);
      expect(getProductBySlugResponse.body).toHaveProperty('name', productData.name);

      // 8. Admin atualiza produto
      const updateProductData = {
        name: 'iPhone 15 Pro Max - Edição Limitada',
        price: '1399.99',
        stock: 25
      };

      const updateProductResponse = await request(app)
        .patch(`/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateProductData)
        .expect(200);

      expect(updateProductResponse.body).toHaveProperty('name', updateProductData.name);
      expect(updateProductResponse.body).toHaveProperty('priceCents', 139999);
      expect(updateProductResponse.body).toHaveProperty('stock', 25);

      // 9. Admin desativa produto
      const toggleProductResponse = await request(app)
        .patch(`/admin/products/${productId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: false })
        .expect(200);

      expect(toggleProductResponse.body).toHaveProperty('active', false);

      // 10. Usuário público não deve ver produto inativo
      const publicListProductsAfterToggleResponse = await request(app)
        .get('/products')
        .expect(200);

      expect(publicListProductsAfterToggleResponse.body).toHaveLength(0);

      // 11. Admin ainda deve ver produto inativo
      const adminListProductsAfterToggleResponse = await request(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminListProductsAfterToggleResponse.body).toHaveLength(1);
      expect(adminListProductsAfterToggleResponse.body[0]).toHaveProperty('active', false);

      // 12. Admin reativa produto
      await request(app)
        .patch(`/admin/products/${productId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: true })
        .expect(200);

      // 13. Usuário público deve ver produto ativo novamente
      const publicListProductsFinalResponse = await request(app)
        .get('/products')
        .expect(200);

      expect(publicListProductsFinalResponse.body).toHaveLength(1);
      expect(publicListProductsFinalResponse.body[0]).toHaveProperty('active', true);
    });

    it('deve filtrar produtos por categoria', async () => {
      const admin = await createTestUser({
        name: 'Admin Teste',
        email: 'admin2@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const adminToken = generateTestToken({ id: admin.id, role: admin.role });

      // Criar duas categorias
      const category1Response = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Smartphones',
          slug: 'smartphones'
        });

      const category2Response = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Laptops',
          slug: 'laptops'
        });

      const category1Id = category1Response.body.id;
      const category2Id = category2Response.body.id;

      // Criar produtos em cada categoria
      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category1Id,
          name: 'iPhone 14',
          slug: 'iphone-14',
          description: 'iPhone 14',
          price: '999.99',
          stock: 10
        });

      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category1Id,
          name: 'Samsung Galaxy S23',
          slug: 'samsung-galaxy-s23',
          description: 'Samsung Galaxy S23',
          price: '899.99',
          stock: 15
        });

      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category2Id,
          name: 'MacBook Pro',
          slug: 'macbook-pro',
          description: 'MacBook Pro',
          price: '2499.99',
          stock: 5
        });

      // Filtrar produtos por categoria de smartphones
      const smartphonesResponse = await request(app)
        .get(`/products?categoryId=${category1Id}`)
        .expect(200);

      expect(smartphonesResponse.body).toHaveLength(2);
      smartphonesResponse.body.forEach((product: any) => {
        expect(product).toHaveProperty('categoryId', category1Id);
      });

      // Filtrar produtos por categoria de laptops
      const laptopsResponse = await request(app)
        .get(`/products?categoryId=${category2Id}`)
        .expect(200);

      expect(laptopsResponse.body).toHaveLength(1);
      expect(laptopsResponse.body[0]).toHaveProperty('categoryId', category2Id);
      expect(laptopsResponse.body[0]).toHaveProperty('name', 'MacBook Pro');
    });

    it('deve buscar produtos por termo', async () => {
      const admin = await createTestUser({
        name: 'Admin Teste',
        email: 'admin3@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const adminToken = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria
      const categoryResponse = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Eletrônicos',
          slug: 'eletronicos'
        });

      const categoryId = categoryResponse.body.id;

      // Criar produtos com nomes diferentes
      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: categoryId,
          name: 'iPhone 15 Pro',
          slug: 'iphone-15-pro',
          description: 'Smartphone Apple iPhone 15 Pro',
          price: '1199.99',
          stock: 10
        });

      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: categoryId,
          name: 'Samsung Galaxy Note',
          slug: 'samsung-galaxy-note',
          description: 'Smartphone Samsung Galaxy Note',
          price: '999.99',
          stock: 8
        });

      await request(app)
        .post('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: categoryId,
          name: 'iPad Pro',
          slug: 'ipad-pro',
          description: 'Tablet Apple iPad Pro',
          price: '1099.99',
          stock: 12
        });

      // Buscar por "iPhone"
      const iPhoneSearchResponse = await request(app)
        .get('/products?search=iPhone')
        .expect(200);

      expect(iPhoneSearchResponse.body).toHaveLength(1);
      expect(iPhoneSearchResponse.body[0]).toHaveProperty('name', 'iPhone 15 Pro');

      // Buscar por "Samsung"
      const samsungSearchResponse = await request(app)
        .get('/products?search=Samsung')
        .expect(200);

      expect(samsungSearchResponse.body).toHaveLength(1);
      expect(samsungSearchResponse.body[0]).toHaveProperty('name', 'Samsung Galaxy Note');

      // Buscar por "Pro" (deve encontrar iPhone e iPad)
      const proSearchResponse = await request(app)
        .get('/products?search=Pro')
        .expect(200);

      expect(proSearchResponse.body).toHaveLength(2);
      const productNames = proSearchResponse.body.map((p: any) => p.name);
      expect(productNames).toContain('iPhone 15 Pro');
      expect(productNames).toContain('iPad Pro');
    });
  });
});