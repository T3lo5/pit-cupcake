import { describe, it, expect, beforeEach } from '@jest/globals';
import * as AuthService from '../services/AuthService.js';
import { prisma } from '../libs/prisma.js';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      };

      const result = await AuthService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe('CUSTOMER');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('deve falhar ao tentar registrar com email já existente', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      };

      // Primeiro registro
      await AuthService.register(userData);

      // Segundo registro com mesmo email deve falhar
      await expect(AuthService.register(userData)).rejects.toEqual({
        statusCode: 400,
        message: 'Email já cadastrado'
      });
    });

    it('deve criptografar a senha corretamente', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      };

      await AuthService.register(userData);

      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      expect(user).toBeTruthy();
      expect(user!.passwordHash).not.toBe(userData.password);
      
      const isPasswordValid = await bcrypt.compare(userData.password, user!.passwordHash);
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await AuthService.register({
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

      const result = await AuthService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginData.email);
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('deve falhar com email inexistente', async () => {
      const loginData = {
        email: 'inexistente@example.com',
        password: '123456'
      };

      await expect(AuthService.login(loginData)).rejects.toEqual({
        statusCode: 401,
        message: 'Credenciais inválidas'
      });
    });

    it('deve falhar com senha incorreta', async () => {
      const loginData = {
        email: 'joao@example.com',
        password: 'senhaerrada'
      };

      await expect(AuthService.login(loginData)).rejects.toEqual({
        statusCode: 401,
        message: 'Credenciais inválidas'
      });
    });
  });

  describe('refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await AuthService.register({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });
      refreshToken = result.refreshToken;
    });

    it('deve gerar novo access token com refresh token válido', async () => {
      const result = await AuthService.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.length).toBeGreaterThan(0);
    });

    it('deve falhar com refresh token inválido', async () => {
      const invalidToken = 'token-invalido';

      await expect(AuthService.refresh(invalidToken)).rejects.toEqual({
        statusCode: 401,
        message: 'Refresh token inválido'
      });
    });

    it('deve falhar com refresh token vazio', async () => {
      await expect(AuthService.refresh('')).rejects.toEqual({
        statusCode: 401,
        message: 'Refresh token inválido'
      });
    });
  });
});