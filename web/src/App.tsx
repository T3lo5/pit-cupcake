import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export default function App({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">Cupcakes</Link>
          <nav className="ml-auto flex gap-4">
            <Link to="/cart">Carrinho</Link>
            <Link to="/orders">Pedidos</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500">
          Cupcakes © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
