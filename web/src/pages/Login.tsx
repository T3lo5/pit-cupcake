import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@cupcakes.dev');
  const [password, setPassword] = useState('admin123');
  const [msg, setMsg] = useState<string | null>(null);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();
  const loc = useLocation() as any;

  const onLogin = async () => {
    setMsg(null);
    try {
      const r = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = r.data;
      setAuth({ user, accessToken, refreshToken });
      nav(loc.state?.from?.pathname || '/', { replace: true });
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Erro no login');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Entrar</h1>
      <input
        className="border rounded px-3 py-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2 w-full mb-2"
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={onLogin} className="w-full px-4 py-2 bg-black text-white rounded">
        Entrar
      </button>
      {msg && <div className="mt-3 text-red-600">{msg}</div>}
      <div className="mt-3 text-sm">
        Não tem conta?{' '}
        <Link to="/register" className="text-blue-600">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
