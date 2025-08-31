import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    api
      .get('/orders')
      .then((r) => setOrders(r.data))
      .catch(console.error);
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Meus Pedidos</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="border rounded p-3">
            <div>ID: {o.id}</div>
            <div>Status: {o.status}</div>
            <div>Total: R$ {(o.totalCents / 100).toFixed(2)}</div>
            <Link to={`/orders/${o.id}`} className="text-blue-600">
              Detalhes
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
