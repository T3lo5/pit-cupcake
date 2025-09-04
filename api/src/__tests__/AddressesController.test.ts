import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import { createTestUser, generateTestToken } from './helpers';

// ... existing code ...
describe('AddressesController', () => {
  describe('GET /addresses', () => {
    it('deve listar endereços do usuário autenticado', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      // Criar um endereço primeiro
      await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Casa',
          cep: '12345-678',
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          city: 'São Paulo',
          state: 'SP'
        });

      const response = await request(app)
        .get('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('label', 'Casa');
      expect(response.body[0]).toHaveProperty('cep', '12345-678');
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .get('/addresses')
        .expect(401);
    });

    it('deve retornar lista vazia para usuário sem endereços', async () => {
      const user = await createTestUser({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      const response = await request(app)
        .get('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /addresses', () => {
    it('deve criar um novo endereço com sucesso', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      const addressData = {
        label: 'Trabalho',
        cep: '98765-432',
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Sala 101',
        city: 'São Paulo',
        state: 'SP'
      };

      const response = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send(addressData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('label', addressData.label);
      expect(response.body).toHaveProperty('cep', addressData.cep);
      expect(response.body).toHaveProperty('street', addressData.street);
      expect(response.body).toHaveProperty('number', addressData.number);
      expect(response.body).toHaveProperty('complement', addressData.complement);
      expect(response.body).toHaveProperty('city', addressData.city);
      expect(response.body).toHaveProperty('state', addressData.state);
      expect(response.body).toHaveProperty('userId', user.id);
    });

    it('deve criar endereço sem label e complement (campos opcionais)', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      const addressData = {
        cep: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      };

      const response = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send(addressData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('cep', addressData.cep);
      expect(response.body.label).toBeNull();
      expect(response.body.complement).toBeNull();
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      const response = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Faltando campos obrigatórios
          label: 'Casa'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .post('/addresses')
        .send({
          cep: '12345-678',
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP'
        })
        .expect(401);
    });
  });

  describe('PATCH /addresses/:id', () => {
    it('deve atualizar um endereço existente', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      // Criar endereço primeiro
      const createResponse = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Casa',
          cep: '12345-678',
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP'
        });

      const addressId = createResponse.body.id;

      // Atualizar endereço
      const updateData = {
        label: 'Casa Atualizada',
        number: '456'
      };

      const response = await request(app)
        .patch(`/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('label', 'Casa Atualizada');
      expect(response.body).toHaveProperty('number', '456');
      expect(response.body).toHaveProperty('street', 'Rua das Flores'); // Campo não alterado
    });

    it('deve retornar erro 404 para endereço não encontrado', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .patch('/addresses/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ label: 'Novo Label' })
        .expect(404);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .patch('/addresses/some-id')
        .send({ label: 'Novo Label' })
        .expect(401);
    });
  });

  describe('DELETE /addresses/:id', () => {
    it('deve remover um endereço existente', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      // Criar endereço primeiro
      const createResponse = await request(app)
        .post('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Casa',
          cep: '12345-678',
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP'
        });

      const addressId = createResponse.body.id;

      // Remover endereço
      await request(app)
        .delete(`/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verificar se foi removido
      const listResponse = await request(app)
        .get('/addresses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listResponse.body).toHaveLength(0);
    });

    it('deve retornar erro 404 para endereço não encontrado', async () => {
      const user = await createTestUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });

      const token = generateTestToken({ id: user.id, role: user.role });

      await request(app)
        .delete('/addresses/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('deve retornar erro 401 para usuário não autenticado', async () => {
      await request(app)
        .delete('/addresses/some-id')
        .expect(401);
    });
  });
});