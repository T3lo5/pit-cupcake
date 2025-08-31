import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('Cliente');
  const [email, setEmail] = useState('cliente@cupcakes.dev');
  const [password, setPassword] = useState('cliente123');
  const [msg, setMsg] = useState<string | null>(null);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();

  const onRegister = async () => {
    setMsg(null);
    try {
      const r = await api.post('/auth/register', { name, email, password });
      const { user, accessToken, refreshToken } = r.data;
      setAuth({ user, accessToken, refreshToken });
      nav('/', { replace: true });
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Erro no cadastro');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Cadastro</h1>
      <input
        className="border rounded px-3 py-2 w-full mb-2"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button onClick={onRegister} className="w-full px-4 py-2 bg-black text-white rounded">
        Cadastrar
      </button>
      {msg && <div className="mt-3 text-red-600">{msg}</div>}
    </div>
  );
}
