import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/orders')
      .then((r) => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((a, o) => a + (o.totalCents || 0), 0);
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const paid = orders.filter((o) => o.status === 'PAID').length;
  const shipped = orders.filter((o) => o.status === 'SHIPPED').length;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Admin</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Pedidos" value={orders.length} />
        <Card title="Receita (R$)" value={(totalRevenue / 100).toFixed(2)} />
        <Card title="Pendentes" value={pending} />
        <Card title="Enviados" value={shipped} />
      </div>

      <section className="border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          <Link to="/admin/orders" className="text-blue-600">
            Ver todos
          </Link>
        </div>
        {loading ? (
          'Carregando...'
        ) : (
          <ul className="divide-y">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">
                      #{o.id} - {o.user?.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      Pagamento: {o.payment?.method} • {o.payment?.status}
                    </div>
                    <div className="text-sm">
                      Entrega: {o.delivery?.status || 'PENDING'}{' '}
                      {o.delivery?.trackingCode ? `• ${o.delivery.trackingCode}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ {(o.totalCents / 100).toFixed(2)}</div>
                    <div className="text-sm">Status: {o.status}</div>
                    <Link to={`/admin/orders/${o.id}`} className="text-blue-600 text-sm">
                      Detalhes
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
