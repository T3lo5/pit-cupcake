import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';

export default function Header() {
  const { isLogged, isAdmin, user, logout } = useAuth();
  const items = useCart((s) => s.items);
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold">
          Cupcakes
        </Link>
        <nav className="ml-auto flex gap-4 items-center">
          <Link to="/cart">Carrinho ({items.reduce((a, i) => a + i.quantity, 0)})</Link>
          <Link to="/orders">Pedidos</Link>
          {isAdmin() && (
            <>
              <Link to="/admin">Admin</Link>
              <Link to="/admin/products">Produtos</Link>
              <Link to="/admin/orders">Pedidos (Admin)</Link>
              <Link to="/admin/banners">Banners</Link>
            </>
          )}{' '}
          {!isLogged() ? (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Cadastrar</Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{user?.name}</span>
              <button onClick={onLogout} className="px-3 py-1 border rounded">
                Sair
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
