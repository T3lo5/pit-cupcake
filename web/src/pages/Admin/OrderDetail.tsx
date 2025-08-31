import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useParams } from 'react-router-dom';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('AGUARDANDO');
  const [orderStatus, setOrderStatus] = useState('CRIADO');
  const [paymentStatus, setPaymentStatus] = useState('PENDENTE');

  const load = async () => {
    const r = await api.get(`/admin/orders/${id}`);
    setOrder(r.data);
    setTracking(r.data.delivery?.tracking || '');
    setDeliveryStatus(r.data.delivery?.status || 'AGUARDANDO');
    setOrderStatus(r.data.status);
    setPaymentStatus(r.data.payment?.status || 'PENDENTE');
  };
  useEffect(() => {
    if (id) load();
  }, [id]);

  const saveDelivery = async () => {
    await api.patch(`/admin/orders/${id}/delivery`, {
      tracking,
      status: deliveryStatus,
      method: order.delivery?.method || 'ENTREGA',
    });
    await load();
  };

  const saveOrderStatus = async () => {
    await api.patch(`/admin/orders/${id}/status`, { status: orderStatus });
    await load();
  };

  const savePayment = async () => {
    await api.patch(`/admin/orders/${id}/payment`, { status: paymentStatus });
    await load();
  };

  if (!order) return <div className="max-w-4xl mx-auto p-4">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Pedido #{order.id}</h1>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Resumo</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-600">Cliente:</span> {order.user?.name} ({order.user?.email}
            )
          </div>
          <div>
            <span className="text-slate-600">Criado em:</span>{' '}
            {new Date(order.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="text-slate-600">Subtotal:</span> R${' '}
            {(order.subtotalCents / 100).toFixed(2)}
          </div>
          <div>
            <span className="text-slate-600">Frete:</span> R${' '}
            {(order.shippingCents / 100).toFixed(2)}
          </div>
          <div>
            <span className="text-slate-600">Desconto:</span> R${' '}
            {(order.discountCents / 100).toFixed(2)}
          </div>
          <div>
            <span className="text-slate-600">Total:</span> R$ {(order.totalCents / 100).toFixed(2)}
          </div>
          <div>
            <span className="text-slate-600">Status do pedido:</span> {order.status}
          </div>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Pagamento</h2>
        <div className="flex flex-wrap gap-3 items-center text-sm">
          <div>Método: {order.payment?.provider}</div>
          <div>Atual: {order.payment?.status}</div>
          {order.payment?.paidAt && (
            <div>Pago em: {new Date(order.payment.paidAt).toLocaleString()}</div>
          )}
          <div className="flex items-center gap-2">
            <label>Novo status:</label>
            <select
              className="border rounded px-2 py-1"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              {['PENDENTE', 'CONFIRMADO', 'FALHOU'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="px-3 py-1 border rounded" onClick={savePayment}>
              Salvar
            </button>
          </div>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Entrega</h2>
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <div>Método: {order.delivery?.method || 'ENTREGA'}</div>
          <input
            className="border rounded px-2 py-1"
            placeholder="Código de rastreio"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1"
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
          >
            {['AGUARDANDO', 'ROTA', 'ENTREGUE'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="px-3 py-1 border rounded" onClick={saveDelivery}>
            Salvar entrega
          </button>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Status do Pedido</h2>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1"
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            {['CRIADO', 'PAGO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
          <button className="px-3 py-1 border rounded" onClick={saveOrderStatus}>
            Salvar status
          </button>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Itens</h2>
        <ul className="list-disc pl-6 text-sm">
          {order.items.map((it: any) => (
            <li key={it.id}>
              {it.nameSnap} x{it.quantity} — R$ {((it.priceCents * it.quantity) / 100).toFixed(2)}
            </li>
          ))}
        </ul>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Endereço</h2>
        <div className="text-sm">
          {order.address?.street}, {order.address?.number} — {order.address?.city}/
          {order.address?.state} — {order.address?.cep}
        </div>
      </section>
    </div>
  );
}
