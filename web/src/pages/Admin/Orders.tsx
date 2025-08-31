import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('ALL');

  const load = async () => {
    const r = await api.get('/admin/orders');
    setOrders(r.data);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = status === 'ALL' ? orders : orders.filter((o) => o.status === status);

  const markShipped = async (id: string) => {
    await api.patch(`/admin/orders/${id}/status`, { status: 'SAIU_PARA_ENTREGA' });
    await api.patch(`/admin/orders/${id}/delivery`, { status: 'ROTA' });
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Pedidos (Admin)</h1>
        <select
          className="border rounded px-3 py-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {[
            'ALL',
            'CRIADO',
            'PAGO',
            'EM_PREPARO',
            'SAIU_PARA_ENTREGA',
            'ENTREGUE',
            'CANCELADO',
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">
                  #{o.id} - {o.user?.name} ({o.user?.email})
                </div>
                <div className="text-sm text-slate-600">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
                <div className="text-sm">
                  Pagamento: {o.payment?.provider} • {o.payment?.status}{' '}
                  {o.payment?.paidAt ? `• ${new Date(o.payment.paidAt).toLocaleString()}` : ''}
                </div>
                <div className="text-sm">
                  Entrega: {o.delivery?.method} • {o.delivery?.status}{' '}
                  {o.delivery?.tracking ? `• ${o.delivery.tracking}` : ''}
                </div>
                <div className="text-sm">
                  Endereço: {o.address?.street}, {o.address?.number} - {o.address?.city}/
                  {o.address?.state} - {o.address?.cep}
                </div>
                <div className="text-sm">
                  Itens: {o.items.map((it: any) => `${it.nameSnap} x${it.quantity}`).join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">R$ {(o.totalCents / 100).toFixed(2)}</div>
                <div className="text-sm">Status: {o.status}</div>
                <div className="flex gap-2 mt-2 justify-end">
                  <Link to={`/admin/orders/${o.id}`} className="px-3 py-1 border rounded">
                    Detalhes
                  </Link>
                  {o.status !== 'SAIU_PARA_ENTREGA' && o.status !== 'ENTREGUE' && (
                    <button
                      onClick={() => markShipped(o.id)}
                      className="px-3 py-1 bg-black text-white rounded"
                    >
                      Marcar enviado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && <div>Nenhum pedido.</div>}
      </div>
    </div>
  );
}
