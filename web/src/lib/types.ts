export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image?: string;
    description?: string;
  };
  link?: string;
  active: boolean;
  order: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
