import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';
import { createTestUser, generateTestToken, createTestCategory } from './helpers.js';

describe('AdminCategoriesController', () => {
  describe('GET /admin/categories', () => {
    it('deve listar todas as categorias (incluindo inativas) para admin', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categorias ativas e inativas
      await createTestCategory({
        name: 'Categoria Ativa',
        slug: 'categoria-ativa',
        active: true
      });

      await createTestCategory({
        name: 'Categoria Inativa',
        slug: 'categoria-inativa',
        active: false
      });

      const response = await request(app)
        .get('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2); // Deve incluir ativas e inativas
      
      const categoryNames = response.body.map((cat: any) => cat.name);
      expect(categoryNames).toContain('Categoria Ativa');
      expect(categoryNames).toContain('Categoria Inativa');
    });

    it('deve retornar erro 403 para usuário não admin', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .get('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/admin/categories')
        .expect(401);
    });

    it('deve retornar lista vazia quando não há categorias', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      const response = await request(app)
        .get('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /admin/categories', () => {
    it('deve criar uma nova categoria com sucesso', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      const categoryData = {
        name: 'Nova Categoria',
        slug: 'nova-categoria'
      };

      const response = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', categoryData.name);
      expect(response.body).toHaveProperty('slug', categoryData.slug);
      expect(response.body).toHaveProperty('active', true); // Padrão deve ser true
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('deve retornar erro 400 para slug duplicado', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      // Criar categoria primeiro
      await createTestCategory({
        name: 'Categoria Existente',
        slug: 'categoria-existente'
      });

      // Tentar criar com mesmo slug
      const response = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Outra Categoria',
          slug: 'categoria-existente'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123456',
        role: 'ADMIN'
      });

      const token = generateTestToken({ id: admin.id, role: admin.role });

      const response = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Faltando campos obrigatórios
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
        .post('/admin/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nova Categoria',
          slug: 'nova-categoria'
        })
        .expect(403);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .post('/admin/categories')
        .send({
          name: 'Nova Categoria',
          slug: 'nova-categoria'
        })
        .expect(401);
    });
  });
});