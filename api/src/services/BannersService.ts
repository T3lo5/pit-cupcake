import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BannersService {
  async create(data: {
    title: string;
    subtitle?: string;
    image: string;
    link?: string;
    productId?: string;
    active?: boolean;
  }) {
    try {
      console.log('Dados recebidos no service create:', data);

      const createData: any = {
        title: data.title,
        image: data.image,
        active: data.active ?? true,
      };

      if (data.subtitle) {
        createData.subtitle = data.subtitle;
      }

      if (data.link) {
        createData.link = data.link;
      }

      if (data.productId) {
        createData.product = {
          connect: { id: data.productId }
        };
      }

      const banner = await prisma.banner.create({
        data: createData,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              images: {
                select: {
                  url: true,
                  alt: true
                }
              }
            }
          }
        }
      });

      return banner;
    } catch (error) {
      console.error('Erro no service create:', error);
      throw error;
    }
  }

  async list() {
    return await prisma.banner.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            images: {
              select: {
                url: true,
                alt: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async listActive() {
    return await prisma.banner.findMany({
      where: {
        active: true
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            images: {
              select: {
                url: true,
                alt: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getById(id: string) {
    return await prisma.banner.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            images: { // Corrigido aqui
              select: {
                url: true,
                alt: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, data: {
    title?: string;
    subtitle?: string;
    image?: string;
    link?: string;
    productId?: string;
    active?: boolean;
  }) {
    try {
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
      if (data.image !== undefined) updateData.image = data.image;
      if (data.link !== undefined) updateData.link = data.link;
      if (data.active !== undefined) updateData.active = data.active;
      if (data.productId !== undefined) {
        if (data.productId) {
          updateData.product = {
            connect: { id: data.productId }
          };
        } else {
          updateData.product = {
            disconnect: true
          };
        }
      }

      return await prisma.banner.update({
        where: { id },
        data: updateData,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              images: {
                select: {
                  url: true,
                  alt: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro no service update:', error);
      throw error;
    }
  }

  async delete(id: string) {
    return await prisma.banner.delete({
      where: { id }
    });
  }

  async toggleActive(id: string) {
    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      throw new Error('Banner não encontrado');
    }

    return await prisma.banner.update({
      where: { id },
      data: {
        active: !banner.active
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            images: {
              select: {
                url: true,
                alt: true
              }
            }
          }
        }
      }
    });
  }
}
