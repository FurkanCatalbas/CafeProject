import React, { useEffect, useState, useCallback } from 'react';
import { placesService, PlaceDto } from '../../services/placesService';
import { productsService, ProductDto } from '../../services/productsService';
import { ordersService, OrderItemDto } from '../../services/ordersService';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, MapPin, Package } from 'lucide-react';

interface CartItem {
  product: ProductDto;
  quantity: number;
}

const StaffOrderPage: React.FC = () => {
  const [tables, setTables] = useState<PlaceDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedTable, setSelectedTable] = useState<PlaceDto | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tableData, productData] = await Promise.all([
        placesService.getAll(),
        productsService.getAll(),
      ]);
      setTables((tableData || []).filter(t => t.status === 'AVAILABLE' || t.status === 'OCCUPIED'));
      setProducts((productData || []).filter(p => p.isActive));
    } catch {
      setError('Veriler yüklenemedi. Servislerin çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addToCart = (product: ProductDto) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const changeQty = (productId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedTable) { setError('Lütfen bir masa seçin.'); return; }
    if (cart.length === 0) { setError('Sepet boş. Lütfen ürün ekleyin.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const items: OrderItemDto[] = cart.map(i => ({
        productId: i.product.id!,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.price,
        totalPrice: i.product.price * i.quantity,
      }));
      await ordersService.create({ placeId: selectedTable.id!, orderItems: items });
      setCart([]);
      setSelectedTable(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadData();
    } catch (e: any) {
      setError(e?.response?.data?.uiMessage?.text || e?.response?.data?.message || 'Sipariş gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filteredProducts = categoryFilter === 'all' ? products : products.filter(p => p.category === categoryFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sipariş Al</h1>
        <p className="text-gray-500 text-sm mt-1">Masa seçin, ürün ekleyin ve siparişi gönderin.</p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          Sipariş başarıyla iletildi!
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Masa + Menü */}
        <div className="lg:col-span-2 space-y-4">

          {/* Masa Seçimi */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" /> Masa Seç
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    selectedTable?.id === table.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : table.status === 'OCCUPIED'
                      ? 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-500'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  {table.name}
                  <div className={`text-[10px] font-normal mt-0.5 ${selectedTable?.id === table.id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {table.status === 'OCCUPIED' ? 'Dolu' : 'Müsait'}
                  </div>
                </button>
              ))}
              {tables.length === 0 && (
                <p className="col-span-4 text-sm text-gray-400">Uygun masa bulunamadı.</p>
              )}
            </div>
          </div>

          {/* Menü */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> Menü
            </h2>

            {/* Kategori Filtresi */}
            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Tümü' : cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="text-left p-3 rounded-xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all group relative"
                  >
                    <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product.category}</p>
                    <p className="text-blue-600 font-bold text-sm mt-1">₺{product.price.toFixed(2)}</p>
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sağ: Sepet */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit sticky top-6">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-500" /> Sepet
            {cart.length > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs font-black rounded-full px-2 py-0.5">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h2>

          {selectedTable && (
            <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700">
              Masa: {selectedTable.name}
            </div>
          )}

          {cart.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sepet boş</p>
          ) : (
            <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">₺{item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changeQty(item.product.id!, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => changeQty(item.product.id!, 1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.product.id!)} className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center ml-1">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 mt-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Toplam</span>
              <span className="text-lg font-black text-gray-900">₺{totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0 || !selectedTable}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
            >
              {submitting ? 'Gönderiliyor...' : 'Siparişi Gönder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffOrderPage;
