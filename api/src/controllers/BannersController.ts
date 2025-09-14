import { Request, Response } from 'express';
import { BannersService } from '../services/BannersService';

export class BannersController {
  private bannersService: BannersService;

  constructor() {
    this.bannersService = new BannersService();
  }

  async create(req: Request, res: Response) {
    try {
      console.log('Dados recebidos no controller:', req.body);

      const { title, subtitle, image, link, productId, active } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          error: 'Title é obrigatório e deve ser uma string não vazia'
        });
      }

      if (!image || typeof image !== 'string' || image.trim() === '') {
        return res.status(400).json({
          error: 'Image é obrigatório e deve ser uma string não vazia'
        });
      }

      if (productId !== undefined && productId !== null) {
        if (typeof productId !== 'string' || productId.trim() === '') {
          return res.status(400).json({
            error: 'ProductId deve ser uma string válida ou undefined'
          });
        }
      }

      const bannerData = {
        title: title.trim(),
        subtitle: subtitle && typeof subtitle === 'string' ? subtitle.trim() : undefined,
        image: image.trim(),
        link: link && typeof link === 'string' ? link.trim() : undefined,
        productId: productId && typeof productId === 'string' ? productId.trim() : undefined,
        active: active !== undefined ? Boolean(active) : true
      };

      console.log('Dados processados para criação:', bannerData);

      const banner = await this.bannersService.create(bannerData);
      res.status(201).json(banner);
    } catch (error: any) {
      console.error('Erro no controller create:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Já existe um banner com esses dados'
        });
      }

      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'ProductId fornecido não existe'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const banners = await this.bannersService.list();
      res.json(banners);
    } catch (error: any) {
      console.error('Erro no controller list:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async listActive(req: Request, res: Response) {
    try {
      const banners = await this.bannersService.listActive();
      res.json(banners);
    } catch (error: any) {
      console.error('Erro no controller listActive:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, subtitle, image, link, productId, active } = req.body;

      console.log('Dados recebidos para update:', { id, body: req.body });

      const bannerData = {
        title: title?.trim(),
        subtitle: subtitle && typeof subtitle === 'string' ? subtitle.trim() : undefined,
        image: image?.trim(),
        link: link && typeof link === 'string' ? link.trim() : undefined,
        productId: productId && typeof productId === 'string' ? productId.trim() : undefined,
        active: active !== undefined ? Boolean(active) : undefined
      };

      const banner = await this.bannersService.update(id, bannerData);
      res.json(banner);
    } catch (error: any) {
      console.error('Erro no controller update:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.bannersService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Erro no controller delete:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async toggleActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const banner = await this.bannersService.toggleActive(id);
      res.json(banner);
    } catch (error: any) {
      console.error('Erro no controller toggleActive:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const banner = await this.bannersService.getById(id);

      if (!banner) {
        return res.status(404).json({
          error: 'Banner não encontrado'
        });
      }

      res.json(banner);
    } catch (error: any) {
      console.error('Erro no controller getById:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}
