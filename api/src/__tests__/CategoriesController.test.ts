import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import { createTestCategory } from './helpers';

describe('CategoriesController', () => {
  describe('GET /categories', () => {
    it('deve listar todas as categorias ativas', async () => {
      // Criar algumas categorias de teste
      await createTestCategory({
        name: 'Eletrônicos',
        slug: 'eletronicos',
        active: true
      });

      await createTestCategory({
        name: 'Roupas',
        slug: 'roupas',
        active: true
      });

      await createTestCategory({
        name: 'Categoria Inativa',
        slug: 'categoria-inativa',
        active: false
      });

      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2); // Apenas categorias ativas
      
      const categoryNames = response.body.map((cat: any) => cat.name);
      expect(categoryNames).toContain('Eletrônicos');
      expect(categoryNames).toContain('Roupas');
      expect(categoryNames).not.toContain('Categoria Inativa');
    });

    it('deve retornar lista vazia quando não há categorias ativas', async () => {
      // Criar apenas categoria inativa
      await createTestCategory({
        name: 'Categoria Inativa',
        slug: 'categoria-inativa',
        active: false
      });

      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('deve retornar categorias com estrutura correta', async () => {
      await createTestCategory({
        name: 'Livros',
        slug: 'livros',
        active: true
      });

      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name', 'Livros');
      expect(response.body[0]).toHaveProperty('slug', 'livros');
      expect(response.body[0]).toHaveProperty('active', true);
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });

    it('deve funcionar sem autenticação (endpoint público)', async () => {
      await createTestCategory({
        name: 'Categoria Pública',
        slug: 'categoria-publica',
        active: true
      });

      // Não enviando token de autenticação
      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', 'Categoria Pública');
    });
  });
});