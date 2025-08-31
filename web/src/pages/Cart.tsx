import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart';

export default function Cart() {
  const { items, setQty, remove, clear } = useCart((s) => ({
    items: s.items,
    setQty: s.setQty,
    remove: s.remove,
    clear: s.clear,
  }));

  // Deriva subtotal diretamente dos items para garantir atualização do React
  const subtotalCents = items.reduce((acc, it) => {
    const price = Math.max(0, Math.floor(Number(it.priceCents) || 0)); // garante inteiro em centavos
    const q = Math.max(1, Number(it.quantity) || 1);
    return acc + price * q;
  }, 0);

  const navigate = useNavigate();

  const shippingCents = 1000;
  const totalCents = (Number(subtotalCents) || 0) + shippingCents;

  const formatMoney = (cents: number) => `R$ ${(Math.max(0, Number(cents || 0)) / 100).toFixed(2)}`;

  if (!items.length) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Carrinho</h1>
        <div>Seu carrinho está vazio.</div>
        <div className="mt-4">
          <Link to="/" className="px-4 py-2 border rounded">
            Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold mb-4">Carrinho</h1>
        <ul className="divide-y">
          {items.map((it) => {
            const price = Math.max(0, Math.floor(Number(it.priceCents) || 0));
            const q = Math.max(1, Number(it.quantity) || 1);
            const lineTotal = price * q;

            return (
              <li key={it.productId} className="py-4 flex items-center gap-4">
                {it.image && (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-slate-600">{formatMoney(price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 border rounded"
                    onClick={() =>
                      setQty(it.productId, Math.max(1, (Number(it.quantity) || 1) - 1))
                    }
                  >
                    -
                  </button>
                  <input
                    className="w-16 border rounded px-2 py-1 text-center"
                    type="number"
                    min={1}
                    value={Math.max(1, Number(it.quantity) || 1)}
                    onChange={(e) => setQty(it.productId, Math.max(1, Number(e.target.value) || 1))}
                  />
                  <button
                    className="px-2 border rounded"
                    onClick={() => setQty(it.productId, (Number(it.quantity) || 0) + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="w-28 text-right font-medium">{formatMoney(lineTotal)}</div>
                <button className="ml-2 text-red-600 text-sm" onClick={() => remove(it.productId)}>
                  Remover
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4">
          <button className="text-sm text-slate-600 underline" onClick={clear}>
            Limpar carrinho
          </button>
        </div>
      </div>

      <aside className="border rounded p-4 h-fit">
        <h2 className="text-lg font-semibold mb-3">Resumo</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>{formatMoney(shippingCents)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
        </div>
        <button
          className="mt-4 w-full px-4 py-2 bg-black text-white rounded"
          onClick={() => navigate('/checkout')}
        >
          Ir para o checkout
        </button>
        <div className="mt-2 text-center">
          <Link to="/" className="text-sm text-slate-600 underline">
            Continuar comprando
          </Link>
        </div>
      </aside>
    </div>
  );
}
