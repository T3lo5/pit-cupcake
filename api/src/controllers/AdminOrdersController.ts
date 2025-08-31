import { Request, Response } from 'express';
import * as S from '../services/AdminOrdersService.js';

export async function list(req: Request, res: Response) {
  const orders = await S.listAll();
  res.json(orders);
}

export async function getOne(req: Request, res: Response) {
  const order = await S.getById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
  res.json(order);
}

export async function setStatus(req: Request, res: Response) {
  const { status } = req.body;
  const updated = await S.setOrderStatus(req.params.id, status);
  res.json(updated);
}

export async function updateDelivery(req: Request, res: Response) {
  const updated = await S.updateDelivery(req.params.id, req.body);
  res.json(updated);
}

export async function setPaymentStatus(req: Request, res: Response) {
  const { status } = req.body;
  const updated = await S.setPaymentStatus(req.params.id, status);
  res.json(updated);
}
