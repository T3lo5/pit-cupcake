import { describe, it, expect, beforeEach } from '@jest/globals';
import * as ProductsService from '../services/ProductsService.js';
import { prisma } from '../libs/prisma.js';

describe('ProductsService', () => {
  let categoryId: string;

  beforeEach(async () => {
    // Criar categoria para os testes
    const category = await prisma.category.create({
      data: {
        name: 'Cupcakes',
        slug: 'cupcakes',
        active: true
      }
    });
    categoryId = category.id;
  });

  describe('create', () => {
    it('deve criar um produto com sucesso', async () => {
      const productData = {
        name: 'Cupcake de Chocolate',
        slug: 'cupcake-chocolate',
        description: 'Delicioso cupcake de chocolate',
        priceCents: 500,
        stock: 10,
        active: true,
        categoryId
      };

      const result = await ProductsService.create(productData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(productData.name);
      expect(result.slug).toBe(productData.slug);
      expect(result.priceCents).toBe(productData.priceCents);
      expect(result.stock).toBe(productData.stock);
      expect(result.categoryId).toBe(categoryId);
    });

    it('deve falhar com preço negativo', async () => {
      const productData = {
        name: 'Cupcake de Chocolate',
        slug: 'cupcake-chocolate',
        description: 'Delicioso cupcake de chocolate',
        priceCents: -100,
        stock: 10,
        active: true,
        categoryId
      };

      await expect(ProductsService.create(productData)).rejects.toEqual({
        statusCode: 400,
        message: 'Preço inválido'
      });
    });

    it('deve falhar com estoque negativo', async () => {
      const productData = {
        name: 'Cupcake de Chocolate',
        slug: 'cupcake-chocolate',
        description: 'Delicioso cupcake de chocolate',
        priceCents: 500,
        stock: -5,
        active: true,
        categoryId
      };

      await expect(ProductsService.create(productData)).rejects.toEqual({
        statusCode: 400,
        message: 'Estoque inválido'
      });
    });
  });

  describe('list', () => {
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
          },
          {
            name: 'Cupcake Inativo',
            slug: 'cupcake-inativo',
            description: 'Produto inativo',
            priceCents: 300,
            stock: 5,
            active: false,
            categoryId
          }
        ]
      });
    });

    it('deve listar produtos ativos com paginação', async () => {
      const result = await ProductsService.list({ page: 1, limit: 10 });

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('pages');
      expect(result.items).toHaveLength(2); // Apenas produtos ativos
      expect(result.total).toBe(2);
    });

    it('deve filtrar produtos por busca', async () => {
      const result = await ProductsService.list({ search: 'chocolate' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toContain('Chocolate');
    });

    it('deve filtrar produtos por categoria', async () => {
      const result = await ProductsService.list({ category: categoryId });

      expect(result.items).toHaveLength(2);
      expect(result.items.every(item => item.categoryId === categoryId)).toBe(true);
    });

    it('deve aplicar paginação corretamente', async () => {
      const result = await ProductsService.list({ page: 1, limit: 1 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(2);
    });
  });

  describe('getBySlug', () => {
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
      const result = await ProductsService.getBySlug(productSlug);

      expect(result).toBeTruthy();
      expect(result!.slug).toBe(productSlug);
      expect(result!.name).toBe('Cupcake de Chocolate');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('images');
    });

    it('deve retornar null para slug inexistente', async () => {
      const result = await ProductsService.getBySlug('slug-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
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
        priceCents: 600,
        stock: 15
      };

      const result = await ProductsService.update(productId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.priceCents).toBe(updateData.priceCents);
      expect(result.stock).toBe(updateData.stock);
    });

    it('deve falhar ao atualizar com preço negativo', async () => {
      const updateData = { priceCents: -100 };

      await expect(ProductsService.update(productId, updateData)).rejects.toEqual({
        statusCode: 400,
        message: 'Preço inválido'
      });
    });

    it('deve falhar ao atualizar com estoque negativo', async () => {
      const updateData = { stock: -5 };

      await expect(ProductsService.update(productId, updateData)).rejects.toEqual({
        statusCode: 400,
        message: 'Estoque inválido'
      });
    });
  });

  describe('remove', () => {
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
      await expect(ProductsService.remove(productId)).resolves.not.toThrow();

      const product = await prisma.product.findUnique({ where: { id: productId } });
      expect(product).toBeNull();
    });

    it('deve falhar ao tentar remover produto inexistente', async () => {
      await expect(ProductsService.remove('id-inexistente')).rejects.toThrow();
    });
  });
});