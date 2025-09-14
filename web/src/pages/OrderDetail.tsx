import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceCents: number;
  nameSnap: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ id: string; url: string }>;
  };
}

interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Payment {
  id: string;
  provider: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';
  paidAt?: string;
}

interface Delivery {
  id: string;
  method: 'RETIRADA' | 'ENTREGA';
  status: 'AGUARDANDO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';
  tracking?: string;
  updatedAt: string;
}

interface Order {
  id: string;
  status: 'CRIADO' | 'PAGO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE';
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment: Payment;
  delivery: Delivery;
  address: Address;
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((r) => {
        setOrder(r.data);
      })
      .catch((error) => {
        console.error('Erro ao carregar pedido:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'CRIADO':
        return 'text-yellow-600 bg-yellow-100';
      case 'PAGO':
        return 'text-blue-600 bg-blue-100';
      case 'EM_PREPARO':
        return 'text-orange-600 bg-orange-100';
      case 'SAIU_PARA_ENTREGA':
        return 'text-purple-600 bg-purple-100';
      case 'ENTREGUE':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'CRIADO':
        return 'Criado';
      case 'PAGO':
        return 'Pago';
      case 'EM_PREPARO':
        return 'Em Preparo';
      case 'SAIU_PARA_ENTREGA':
        return 'Saiu para Entrega';
      case 'ENTREGUE':
        return 'Entregue';
      default:
        return status;
    }
  };

  const getDeliveryStatusText = (status: string) => {
    switch (status) {
      case 'AGUARDANDO':
        return 'Aguardando';
      case 'EM_PREPARO':
        return 'Em Preparo';
      case 'SAIU_PARA_ENTREGA':
        return 'Saiu para Entrega';
      case 'ENTREGUE':
        return 'Entregue';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentProviderText = (provider: string) => {
    switch (provider) {
      case 'PIX':
        return 'PIX';
      case 'CREDIT_CARD':
        return 'Cartão de Crédito';
      case 'BOLETO':
        return 'Boleto';
      default:
        return provider;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-600">Pedido não encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Pedido #{order.id.slice(-8)}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}
          >
            {getOrderStatusText(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📦 Informações de Entrega</h3>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Método:</span>
                <span className="ml-2 text-blue-600">
                  {order.delivery.method === 'RETIRADA' ? 'Retirada na Loja' : 'Entrega'}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Status da Entrega:</span>
                <span className="ml-2 text-blue-600 font-medium">
                  {getDeliveryStatusText(order.delivery.status)}
                </span>
              </div>

              {order.delivery.tracking && (
                <div>
                  <span className="font-medium text-gray-700">Código de Rastreamento:</span>
                  <div className="mt-1">
                    <code className="bg-white px-3 py-2 rounded border text-sm font-mono text-blue-600 select-all block">
                      {order.delivery.tracking}
                    </code>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(order.delivery.tracking!)}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Copiar Código
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {order.delivery.tracking && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Rastrear pedido:</p>
                  <div className="flex flex-col gap-2">
                    <a
                      href={`https://www.correios.com.br/precisa-de-ajuda/rastro-e-reembolso/rastreamento-de-objetos?codigo=${order.delivery.tracking}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors text-center"
                    >
                      Rastrear nos Correios
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              💳 Informações de Pagamento
            </h3>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Método:</span>
                <span className="ml-2 text-green-600">
                  {getPaymentProviderText(order.payment.provider)}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    order.payment.status === 'CONFIRMADO'
                      ? 'text-green-600'
                      : order.payment.status === 'PENDENTE'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {getPaymentStatusText(order.payment.status)}
                </span>
              </div>

              {order.payment.paidAt && (
                <div>
                  <span className="font-medium text-gray-700">Pago em:</span>
                  <span className="ml-2 text-green-600">
                    {new Date(order.payment.paidAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {order.delivery.method === 'ENTREGA' && order.address && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Endereço de Entrega</h3>
            <div className="text-gray-700">
              <p>
                {order.address.street}, {order.address.number}
              </p>
              {order.address.complement && <p>{order.address.complement}</p>}
              <p>{order.address.neighborhood}</p>
              <p>
                {order.address.city} - {order.address.state}
              </p>
              <p>CEP: {order.address.zipCode}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Itens do Pedido</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-3">
              {order.items.map((item: OrderItem) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center flex-1">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.nameSnap}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <span className="font-medium text-gray-800 block">{item.nameSnap}</span>
                      <span className="text-gray-600 text-sm">Quantidade: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-medium text-gray-800">
                    R$ {(item.priceCents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">R$ {(order.subtotalCents / 100).toFixed(2)}</span>
            </div>

            {order.shippingCents > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frete:</span>
                <span className="text-gray-800">R$ {(order.shippingCents / 100).toFixed(2)}</span>
              </div>
            )}

            {order.discountCents > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Desconto:</span>
                <span className="text-green-600">-R$ {(order.discountCents / 100).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-xl font-bold text-green-600">
                R$ {(order.totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Pedido realizado em:</span>
              <div>{new Date(order.createdAt).toLocaleString('pt-BR')}</div>
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>
              <div>{new Date(order.updatedAt).toLocaleString('pt-BR')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
