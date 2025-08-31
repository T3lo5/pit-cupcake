import { create } from 'zustand';

type Toast = { id: number; message: string };
type ToastStore = {
  toasts: Toast[];
  push: (message: string) => void;
  remove: (id: number) => void;
};
let id = 1;
export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (message) => set((s) => ({ toasts: [...s.toasts, { id: id++, message }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
