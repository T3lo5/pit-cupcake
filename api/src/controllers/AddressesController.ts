import { Request, Response } from 'express';
import * as AddressesService from '../services/AddressesService.js';

export async function list(req: Request, res: Response) {
  const addresses = await AddressesService.list(req.user!.id);
  res.json(addresses);
}

export async function create(req: Request, res: Response) {
  const address = await AddressesService.create(req.user!.id, req.body);
  res.status(201).json(address);
}

export async function update(req: Request, res: Response) {
  const address = await AddressesService.update(req.user!.id, req.params.id, req.body);
  res.json(address);
}

export async function remove(req: Request, res: Response) {
  await AddressesService.remove(req.user!.id, req.params.id);
  res.status(204).send();
}
