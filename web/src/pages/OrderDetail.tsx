import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any | null>(null);
  useEffect(() => {
    if (!id) return;
    api
      .get(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(console.error);
  }, [id]);

  if (!order) return <div className="max-w-4xl mx-auto p-4">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Pedido {order.id}</h1>
      <div>Status: {order.status}</div>
      <div>Itens:</div>
      <ul className="list-disc ml-5">
        {order.items.map((it: any) => (
          <li key={it.id}>
            {it.nameSnap} x {it.quantity} — R$ {(it.priceCents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
      <div className="mt-4 font-semibold">Total: R$ {(order.totalCents / 100).toFixed(2)}</div>
    </div>
  );
}
