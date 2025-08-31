import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import Toaster from '../components/Toaster';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const isLogged = useAuth((s) => s.isLogged());
  const loc = useLocation();
  if (!isLogged) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const isAdmin = useAuth((s) => s.isAdmin());
  const loc = useLocation();
  if (!isAdmin) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export function RequireCartNotEmpty({ children }: { children: JSX.Element }) {
  const items = useCart((s) => s.items);
  if (!items.length) return <Navigate to="/cart" replace />;
  return children;
}

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Toaster />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500">
          Cupcakes © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
