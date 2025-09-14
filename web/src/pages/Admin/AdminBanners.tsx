import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  product?: {
    id: string;
    name: string;
    priceCents: number;
  };
  active: boolean;
  order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  image: string;
  productId: string;
  link: string;
  active: boolean;
  order: number;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    image: '',
    productId: '',
    link: '',
    active: true,
    order: 0,
  });

  useEffect(() => {
    loadBanners();
    loadProducts();
  }, []);

  const loadBanners = async () => {
    try {
      const r = await api.get('/banners');
      setBanners(Array.isArray(r.data) ? r.data : []);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const r = await api.get('/products');
      setProducts(r.data.items || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image: banner.image,
        productId: banner.product?.id || '',
        link: '',
        active: banner.active,
        order: banner.order,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        productId: '',
        link: '',
        active: true,
        order: banners.length,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      productId: '',
      link: '',
      active: true,
      order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        image: formData.image,
        link: formData.link || undefined,
        productId: formData.productId || undefined,
        active: formData.active,
      };

      if (editingBanner) {
        await api.patch(`/banners/${editingBanner.id}`, bannerData);
      } else {
        await api.post('/banners', bannerData);
      }

      setShowModal(false);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        productId: '',
        active: true,
        order: 0,
      });
      setEditingBanner(null);
      loadBanners();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erro desconhecido';
      setError(`Erro ao salvar banner: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBanner = async (id: string) => {
    try {
      await api.patch(`/banners/${id}/toggle`);
      await loadBanners();
    } catch (error) {
      console.error('Erro ao alterar banner:', error);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      await api.delete(`/banners/${id}`);
      await loadBanners();
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gerenciar Banners</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Novo Banner
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum banner cadastrado</div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="border rounded p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{banner.title}</h3>
                  {banner.subtitle && <p className="text-sm text-slate-600">{banner.subtitle}</p>}
                  {banner.product && (
                    <p className="text-sm text-blue-600">
                      {banner.product.name} - R$ {(banner.product.priceCents / 100).toFixed(2)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        banner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="text-xs text-slate-500">Ordem: {banner.order}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(banner)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleBanner(banner.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    banner.active
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {banner.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      ={' '}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título do banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subtítulo (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL da Imagem *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Produto (opcional)</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {(product.priceCents / 100).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link Externo (opcional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se preenchido, terá prioridade sobre o produto selecionado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ordem</label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Banner ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingBanner ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
