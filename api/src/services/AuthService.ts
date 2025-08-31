import { prisma } from '../libs/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(input: { name: string; email: string; password: string }) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw { statusCode: 400, message: 'Email já cadastrado' };
  const hash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash: hash, role: 'CUSTOMER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  const tokens = issueTokens({ id: user.id, role: user.role });
  return { user, ...tokens };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw { statusCode: 401, message: 'Credenciais inválidas' };
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw { statusCode: 401, message: 'Credenciais inválidas' };
  const tokens = issueTokens({ id: user.id, role: user.role });
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  return { user: safe, ...tokens };
}

export async function refresh(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
    });
    return { accessToken };
  } catch {
    throw { statusCode: 401, message: 'Refresh token inválido' };
  }
}

function issueTokens(payload: { id: string; role: 'CUSTOMER' | 'ADMIN' }) {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
  });
  return { accessToken, refreshToken };
}
