import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Coffee, MapPin } from 'lucide-react';
import { publicCatalogService } from '../../services/publicCatalogService';
import type { PlaceDto } from '../../services/placesService';
import type { ProductDto } from '../../services/productsService';
import { formatTryCurrency } from '../../utils/formatTryCurrency';

const QrMenuPage: React.FC = () => {
  const { placeId } = useParams();
  const numericPlaceId = Number(placeId);
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!Number.isFinite(numericPlaceId) || numericPlaceId <= 0) {
        setError('Gecersiz masa baglantisi.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [placeData, productData] = await Promise.all([
          publicCatalogService.getPlaceById(numericPlaceId),
          publicCatalogService.getProducts(),
        ]);
        setPlace(placeData);
        setProducts((productData || []).filter((product) => product.isActive !== false));
      } catch {
        setError('Menu verileri su anda yuklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [numericPlaceId]);

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, ProductDto[]>();
    products.forEach((product) => {
      const key = product.category?.trim() || 'Diger';
      const current = groups.get(key) || [];
      current.push(product);
      groups.set(key, current);
    });
    return Array.from(groups.entries());
  }, [products]);

  if (loading) {
    return <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">Yukleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-amber-300">
                <Coffee className="h-4 w-4" />
                QR Menu
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">{place?.name || `Masa #${numericPlaceId}`}</h1>
              <p className="mt-2 max-w-2xl text-sm text-stone-300">
                Bu ekran sadece menuyu gosterir. Siparis vermek icin size verilen ayri QR siparis baglantisini kullanin.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-right">
              <div className="flex items-center gap-2 text-sm text-stone-300">
                <MapPin className="h-4 w-4" />
                Masa
              </div>
              <div className="mt-1 text-lg font-semibold">#{numericPlaceId}</div>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-red-200">{error}</div>}

        <div className="space-y-8">
          {groupedProducts.map(([category, items]) => (
            <section key={category}>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-amber-400/20" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">{category}</h2>
                <div className="h-px flex-1 bg-amber-400/20" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((product) => (
                  <article key={product.id ?? `${category}-${product.name}`} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-300">{product.description || 'Aciklama eklenmemis.'}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-400 px-3 py-2 text-sm font-bold text-stone-950">
                        {formatTryCurrency(product.price)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QrMenuPage;
