import { create } from 'zustand';

type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  image?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setQty: (productId: string, qty: number) => void;
  subtotal: () => number;
};

const STORAGE_KEY = 'cart_items';

const normalizeItem = (i: any): CartItem => ({
  productId: String(i?.productId ?? ''),
  name: String(i?.name ?? ''),
  priceCents: Math.max(0, Math.floor(Number(i?.priceCents ?? 0) || 0)),
  image: i?.image ?? null,
  quantity: Math.max(1, Math.floor(Number(i?.quantity ?? 1) || 1)),
});

const load = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeItem).filter((i) => i.quantity > 0);
  } catch {
    return [];
  }
};

const save = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useCart = create<CartState>((set, get) => ({
  items: load(),

  add: (item, qty = 1) => {
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    const price = Math.max(0, Math.floor(Number(item.priceCents) || 0));
    const items = [...get().items];
    const idx = items.findIndex((it) => it.productId === item.productId);
    if (idx >= 0) {
      items[idx] = {
        ...items[idx],
        quantity: Math.max(1, Math.floor(Number(items[idx].quantity) || 1)) + q,
      };
    } else {
      items.push({
        productId: String(item.productId),
        name: String(item.name),
        priceCents: price,
        image: item.image ?? null,
        quantity: q,
      });
    }
    save(items);
    set({ items });
  },

  remove: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    save(items);
    set({ items });
  },

  clear: () => {
    save([]);
    set({ items: [] });
  },

  setQty: (productId, qty) => {
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    const items = get()
      .items
      .map((i) => (i.productId === productId ? { ...i, quantity: q } : i))
      .filter((i) => i.quantity > 0);
    save(items);
    set({ items });
  },

  subtotal: () => {
    const items = get().items;
    return items.reduce((acc, i) => {
      const price = Math.max(0, Math.floor(Number(i.priceCents) || 0));
      const q = Math.max(1, Math.floor(Number(i.quantity) || 1));
      return acc + price * q;
    }, 0);
  },
}));
