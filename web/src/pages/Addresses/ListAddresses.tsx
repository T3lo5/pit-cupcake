import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function ListAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const load = async () => {
    const r = await api.get('/addresses');
    setAddresses(r.data || []);
  };
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meus endereços</h1>
        <Link to="/addresses/new" className="px-3 py-2 border rounded">
          Novo endereço
        </Link>
      </div>
      <div className="grid gap-3">
        {addresses.map((a) => (
          <div key={a.id} className="border rounded p-3">
            <div className="font-medium">{a.label || 'Sem apelido'}</div>
            <div className="text-sm text-slate-600">
              {a.street}, {a.number} {a.complement ? `- ${a.complement}` : ''} — {a.city}/{a.state}{' '}
              — {a.cep}
            </div>
          </div>
        ))}
        {!addresses.length && <div>Você ainda não tem endereços cadastrados.</div>}
      </div>
    </div>
  );
}
