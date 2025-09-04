import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../app.js';

describe('AuthController', () => {
  describe('POST /auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
    });

    it('deve retornar erro 400 para email já cadastrado', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      };

      // Primeiro registro
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro deve falhar
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });

    it('deve validar campos obrigatórios', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao@example.com',
          password: '123456'
        });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: '123456'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('deve retornar erro 401 para credenciais inválidas', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: 'senhaerrada'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('deve retornar erro 401 para email inexistente', async () => {
      const loginData = {
        email: 'inexistente@example.com',
        password: '123456'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao@example.com',
          password: '123456'
        });
      
      refreshToken = response.body.refreshToken;
    });

    it('deve gerar novo access token com refresh token válido', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('deve retornar erro 401 para refresh token inválido', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'token-invalido' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Refresh token inválido');
    });
  });
});