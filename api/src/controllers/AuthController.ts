import { Request, Response } from 'express';
import * as AuthService from '../services/AuthService.js';

export async function register(req: Request, res: Response) {
  const result = await AuthService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await AuthService.login(req.body);
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const result = await AuthService.refresh(req.body.refreshToken);
  res.json(result);
}
