import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, Receipt } from 'lucide-react';
import { publicCatalogService } from '../../services/publicCatalogService';
import type { PlaceDto } from '../../services/placesService';
import type { ProductDto } from '../../services/productsService';
import { formatTryCurrency } from '../../utils/formatTryCurrency';

type CartItem = ProductDto & { quantity: number };

const QrOrderPage: React.FC = () => {
  const { placeId } = useParams();
  const numericPlaceId = Number(placeId);
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        setError('Siparis ekrani su anda yuklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [numericPlaceId]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cart]
  );

  const adjustQuantity = (product: ProductDto, delta: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing && delta < 0) {
        return current;
      }

      if (!existing) {
        return [...current, { ...product, quantity: 1 }];
      }

      return current
        .map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
    });
    setSuccess(null);
  };

  const submitOrder = async () => {
    if (!cart.length) {
      setError('Siparis icin en az bir urun secmelisiniz.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await publicCatalogService.createOrder({
        placeId: numericPlaceId,
        paymentMethod: 'CASH',
        note: note.trim() || undefined,
        orderItems: cart.map((item) => ({
          productId: item.id || 0,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.price),
          totalPrice: Number(item.price) * item.quantity,
        })),
      });
      setCart([]);
      setNote('');
      setSuccess('Siparisiniz mutfaga iletildi.');
    } catch {
      setError('Siparis olusturulamadi. Lutfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Yukleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <main>
          <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">
              <Receipt className="h-4 w-4" />
              QR Siparis
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{place?.name || `Masa #${numericPlaceId}`} icin siparis ver</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Bu ekran sadece siparis vermek icindir. Menu goruntuleme sayfasi bundan bagimsizdir.
            </p>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-red-200">{error}</div>}
          {success && <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-emerald-200">{success}</div>}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const quantity = cart.find((item) => item.id === product.id)?.quantity ?? 0;
              return (
                <article key={product.id ?? product.name} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{product.name}</h2>
                      <p className="mt-2 text-sm text-slate-300">{product.description || 'Aciklama eklenmemis.'}</p>
                    </div>
                    <div className="rounded-2xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950">
                      {formatTryCurrency(product.price)}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(product, -1)}
                      className="rounded-xl border border-white/10 p-2 text-slate-200 disabled:opacity-40"
                      disabled={quantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(product, 1)}
                      className="rounded-xl bg-cyan-400 p-2 text-slate-950"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 lg:sticky lg:top-6 lg:h-fit">
          <h2 className="text-lg font-semibold text-white">Siparis Ozeti</h2>
          <p className="mt-1 text-sm text-slate-300">Masa #{numericPlaceId}</p>

          <div className="mt-5 space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">Henuz urun secilmedi.</div>
            ) : (
              cart.map((item) => (
                <div key={item.id ?? item.name} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/80 px-4 py-3">
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.quantity} adet</div>
                  </div>
                  <div className="text-sm font-semibold">{formatTryCurrency(Number(item.price) * item.quantity)}</div>
                </div>
              ))
            )}
          </div>

          <label className="mt-5 block text-sm font-medium text-slate-200" htmlFor="order-note">
            Siparis Notu
          </label>
          <textarea
            id="order-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ornek: sogansiz, az sekerli, ekstra pecete"
            className="mt-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm text-slate-300">Toplam</span>
            <span className="text-2xl font-semibold text-white">{formatTryCurrency(totalAmount)}</span>
          </div>

          <button
            type="button"
            onClick={submitOrder}
            disabled={submitting || cart.length === 0}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Gonderiliyor...' : 'Siparisi Gonder'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default QrOrderPage;
