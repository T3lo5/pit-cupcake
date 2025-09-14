import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    images?: Array<{ url: string; alt?: string }>;
  };
  link?: string;
  active: boolean;
  order: number;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/banners/active')
      .then((r) => {
        const bannerList = Array.isArray(r.data) ? r.data : [];
        setBanners(bannerList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg mb-8"></div>;
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const BannerContent = () => (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
      <img
        src={currentBanner.image}
        alt={currentBanner.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{currentBanner.title}</h2>
          {currentBanner.subtitle && (
            <p className="text-lg md:text-xl mb-4">{currentBanner.subtitle}</p>
          )}
          {currentBanner.product && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 inline-block">
              <p className="text-sm">A partir de</p>
              <p className="text-xl font-bold">
                R$ {(currentBanner.product.priceCents / 100).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative mb-8">
      {currentBanner.link ? (
        <a href={currentBanner.link} target="_blank" rel="noopener noreferrer">
          <BannerContent />
        </a>
      ) : currentBanner.product ? (
        <Link to={`/product/${currentBanner.product.slug}`}>
          <BannerContent />
        </Link>
      ) : (
        <BannerContent />
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
