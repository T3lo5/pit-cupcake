import { useEffect } from 'react';
import { useToast } from '../store/toast';

export default function Toaster() {
  const { toasts, remove } = useToast();
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), 2500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="bg-black text-white px-4 py-2 rounded shadow">
          {t.message}
        </div>
      ))}
    </div>
  );
}
