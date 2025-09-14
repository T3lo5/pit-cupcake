import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import BannerCarousel from '../components/Banner';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/products')
      .then((r) => setProducts(r.data.items))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <BannerCarousel />

      <h1 className="text-2xl font-semibold mb-4">Vitrine</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="border rounded p-3 hover:shadow">
            {p.images?.[0]?.url && (
              <img
                src={p.images[0].url}
                alt={p.images[0].alt || p.name}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <div className="mt-2 font-medium">{p.name}</div>
            <div className="text-sm text-slate-600">R$ {(p.priceCents / 100).toFixed(2)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
