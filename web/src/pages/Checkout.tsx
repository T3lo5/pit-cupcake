import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useCart } from '../store/cart';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../store/toast';

type Provider = 'PIX' | 'CREDIT_CARD' | 'BOLETO';
type DeliveryMethod = 'RETIRADA' | 'ENTREGA';

export default function Checkout() {
  const { items, clear } = useCart((s) => ({
    items: s.items,
    clear: s.clear,
  }));
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState<string>('');
  const [provider, setProvider] = useState<Provider>('CREDIT_CARD');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('ENTREGA');
  const [loading, setLoading] = useState(true);
  const toast = useToast((s) => s.push);
  const nav = useNavigate();

  const subtotalCents = useMemo(() => {
    return items.reduce((acc, it) => {
      const price = Math.max(0, Math.floor(Number(it.priceCents) || 0));
      const q = Math.max(1, Math.floor(Number(it.quantity) || 1));
      return acc + price * q;
    }, 0);
  }, [items]);

  const shippingCents = 1000;
  const totalCents = useMemo(() => (Number(subtotalCents) || 0) + shippingCents, [subtotalCents]);

  const formatMoney = (cents: number) => `R$ ${(Math.max(0, Number(cents || 0)) / 100).toFixed(2)}`;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get('/addresses')
      .then((r) => {
        if (!mounted) return;
        const list = Array.isArray(r.data) ? r.data : [];
        setAddresses(list);
        if (list.length && !addressId) setAddressId(list[0].id);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const canConfirm = items.length > 0 && (deliveryMethod === 'RETIRADA' || Boolean(addressId));
  const confirm = async () => {
    if (!canConfirm) {
      toast('Adicione um endereço antes de finalizar ou selecione Retirada.');
      return;
    }
    try {
      const r = await api.post('/orders', {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
        })),
        addressId: deliveryMethod === 'ENTREGA' ? addressId : null,
        provider,
        deliveryMethod,
        shippingCents,
        payment: {
          provider,
          status: 'PENDENTE',
        },
      });
      clear();
      toast('Pedido confirmado!');
      nav(`/orders/${r.data.id}`);
    } catch (e: any) {
      console.error(e);
      toast(e?.response?.data?.message || 'Erro ao confirmar pedido');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Entrega</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="del"
                checked={deliveryMethod === 'ENTREGA'}
                onChange={() => setDeliveryMethod('ENTREGA')}
              />
              Entrega
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="del"
                checked={deliveryMethod === 'RETIRADA'}
                onChange={() => setDeliveryMethod('RETIRADA')}
              />
              Retirada no balcão
            </label>
          </div>
        </section>

        {deliveryMethod === 'ENTREGA' && (
          <section className="border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Endereço de entrega</h2>
              <Link to="/addresses/new" className="text-sm text-blue-600 underline">
                Cadastrar novo endereço
              </Link>
            </div>

            {loading ? (
              <div>Carregando endereços...</div>
            ) : addresses.length === 0 ? (
              <div className="space-y-2">
                <div>Você ainda não cadastrou endereços.</div>
                <Link to="/addresses/new" className="px-3 py-2 border rounded inline-block">
                  Cadastrar endereço
                </Link>
              </div>
            ) : (
              <select
                className="border rounded px-3 py-2 w-full"
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
              >
                {addresses.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.street}, {a.number} {a.complement ? `- ${a.complement}` : ''} - {a.city}/
                    {a.state} - {a.cep}
                  </option>
                ))}
              </select>
            )}
          </section>
        )}

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Forma de pagamento</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                checked={provider === 'CREDIT_CARD'}
                onChange={() => setProvider('CREDIT_CARD')}
              />
              Cartão de crédito
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                checked={provider === 'PIX'}
                onChange={() => setProvider('PIX')}
              />
              Pix
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                checked={provider === 'BOLETO'}
                onChange={() => setProvider('BOLETO')}
              />
              Boleto
            </label>
          </div>
        </section>

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Itens</h2>
          <ul className="divide-y">
            {items.map((it) => {
              const price = Math.max(0, Math.floor(Number(it.priceCents) || 0));
              const q = Math.max(1, Math.floor(Number(it.quantity) || 1));
              const lineTotal = price * q;
              return (
                <li key={it.productId} className="py-3 flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-slate-600">
                      {q} x {formatMoney(price)}
                    </div>
                  </div>
                  <div className="font-medium">{formatMoney(lineTotal)}</div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside className="border rounded p-4 h-fit">
        <h3 className="text-lg font-semibold mb-3">Resumo</h3>
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
          disabled={!canConfirm}
          onClick={confirm}
          className="mt-4 w-full px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          Confirmar pedido
        </button>
        {deliveryMethod === 'ENTREGA' && addresses.length === 0 && (
          <div className="text-xs text-red-600 mt-2">
            Você precisa cadastrar um endereço para entrega.
          </div>
        )}
      </aside>
    </div>
  );
}
