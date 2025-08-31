import { Request, Response } from 'express';
import * as OrdersService from '../services/OrdersService.js';

export async function create(req: Request, res: Response) {
  const result = await OrdersService.createOrder(req.user!.id, req.body);
  res.status(201).json(result);
}

export async function listMine(req: Request, res: Response) {
  const result = await OrdersService.listOrders(req.user!.id);
  res.json(result);
}

export async function getOne(req: Request, res: Response) {
  const order = await OrdersService.getOrder(req.user!.id, req.params.id);
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
  res.json(order);
}

export async function pay(req: Request, res: Response) {
  const result = await OrdersService.pay(req.user!.id, req.params.id);
  res.json(result);
}

export async function advanceStatus(req: Request, res: Response) {
  const result = await OrdersService.advanceStatus(req.params.id);
  res.json(result);
}
