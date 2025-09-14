import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  active: boolean;
  category?: { id: string; name: string } | null;
  images?: { url: string; alt?: string | null }[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    slug: '',
    description: '',
    price: '0,00', // exibir em reais
    stock: '0',
    active: true,
    image1: '',
    image2: '',
    image3: '',
  });

  const load = async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const [p, c] = await Promise.all([
        api.get('/admin/products'),
        api.get('/categories'),
      ]);

      const pData = Array.isArray(p.data) ? p.data : [];
      const cData = Array.isArray(c.data) ? c.data : [];

      setProducts(pData as Product[]);
      setCategories(cData as Category[]);
      if (!form.categoryId && cData.length) {
        setForm((f) => ({ ...f, categoryId: cData[0].id }));
      }
    } catch (err: any) {
      console.error('Erro ao carregar:', err);
      const msg = err?.response?.data?.message || err?.message || 'Falha ao carregar dados';
      setErrMsg(msg);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setIsCreating(true);
    try {
      const images = [form.image1, form.image2, form.image3]
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => ({ url }));

      await api.post('/admin/products', {
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || null,
        price: form.price,
        stock: Number(form.stock) || 0,
        active: form.active,
        images,
      });

      await load();
      setForm((f) => ({
        ...f,
        name: '',
        slug: '',
        description: '',
        price: '0,00',
        stock: '0',
        image1: '',
        image2: '',
        image3: '',
      }));
      setSuccessMsg('Produto criado com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Erro ao criar produto:', err);
      const msg = err?.response?.data?.message || err?.message || 'Erro ao criar produto';
      setErrMsg(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    setErrMsg(null);
    setToggleLoading(id);
    try {
      await api.patch(`/admin/products/${id}/active`, { active });
      await load();
      setSuccessMsg(`Produto ${active ? 'ativado' : 'desativado'} com sucesso!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao alterar status';
      setErrMsg(msg);
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Produtos (Admin)</h1>

      {errMsg && <div className="p-3 border rounded bg-red-50 text-red-700">{errMsg}</div>}
      {successMsg && (
        <div className="p-3 border rounded bg-green-50 text-green-700">{successMsg}</div>
      )}

      <form onSubmit={onCreate} className="border rounded p-4 grid gap-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <div className="flex gap-2">
              <select
                className="border rounded px-3 py-2 w-full"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {!categories.length && (
              <div className="text-xs text-slate-500 mt-1">
                Nenhuma categoria. Crie ao menos uma para cadastrar produtos.
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Descrição</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Preço (R$)</label>
            <input
              type="text"
              placeholder="Ex.: 10,00"
              className="border rounded px-3 py-2 w-full"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Estoque</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <label htmlFor="active">Ativo</label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Imagem 1 (URL)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.image1}
              onChange={(e) => setForm({ ...form, image1: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Imagem 2 (URL)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.image2}
              onChange={(e) => setForm({ ...form, image2: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Imagem 3 (URL)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.image3}
              onChange={(e) => setForm({ ...form, image3: e.target.value })}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded"
            disabled={!categories.length}
          >
            Criar produto
          </button>
        </div>
      </form>

      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Lista</h2>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="grid gap-3">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((p) => (
                <div key={p.id} className="border rounded p-3 flex items-center gap-4">
                  {p.images?.[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt={p.images[0].alt || p.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {p.name} {p.active ? '' : '(inativo)'}
                    </div>
                    <div className="text-sm text-slate-600">
                      {p.category?.name} • R$ {(p.priceCents / 100).toFixed(2)} • estoque {p.stock}
                    </div>
                    <div className="text-xs text-slate-500">/{p.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(p.id, !p.active)}
                      className="px-3 py-1 border rounded"
                    >
                      {p.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div>Nenhum produto.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
