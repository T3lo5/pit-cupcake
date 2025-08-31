import { useState } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function NewAddress() {
  const [form, setForm] = useState({
    label: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });
  const nav = useNavigate();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/addresses', {
        label: form.label || '',
        cep: form.cep,
        street: form.street,
        number: form.number,
        complement: form.complement || '',
        city: form.city,
        state: form.state,
      });
      nav('/checkout');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Erro ao salvar endereço');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Novo endereço</h1>
      <form onSubmit={save} className="grid gap-3">
        <div>
          <label className="block text-sm mb-1">Apelido (opcional)</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm mb-1">CEP</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">Rua</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Número</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">Complemento</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.complement}
              onChange={(e) => setForm({ ...form, complement: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Cidade</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Estado</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
        </div>
        <div>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
