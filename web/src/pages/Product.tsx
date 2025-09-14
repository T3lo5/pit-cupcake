import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';

export default function Product() {
  const { slug } = useParams();
  const [prod, setProd] = useState<any | null>(null);
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.push);

  useEffect(() => {
    if (!slug) return;
    api
      .get(`/products/${slug}`)
      .then((r) => setProd(r.data))
      .catch(console.error);
  }, [slug]);

  if (!prod) return <div className="max-w-4xl mx-auto p-4">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Galeria de imagens */}
      {prod.images && prod.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {prod.images.map((image: any, index: number) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt || `${prod.name} - Imagem ${index + 1}`}
              className="w-full h-64 object-cover rounded"
            />
          ))}
        </div>
      )}

      <h1 className="text-2xl font-semibold mt-4">{prod.name}</h1>
      <div className="text-slate-600">R$ {(prod.priceCents / 100).toFixed(2)}</div>
      <p className="mt-2">{prod.description}</p>
      <button
        onClick={() => {
          add(
            {
              productId: prod.id,
              name: prod.name,
              priceCents: Number(prod.priceCents) || 0,
              image: prod.images?.[0]?.url,
            },
            1,
          );
          toast('Adicionado ao carrinho!');
        }}
        className="mt-4 px-4 py-2 bg-black text-white rounded"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
