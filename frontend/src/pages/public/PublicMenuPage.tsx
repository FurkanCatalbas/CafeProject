import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsService, ProductDto } from '../../services/productsService';
import { ordersService } from '../../services/ordersService';
import { Search, ShoppingBag, ChevronRight, Star, RefreshCw, Coffee, Plus, Minus, X, CheckCircle } from 'lucide-react';
import { formatTryCurrency } from '../../utils/formatTryCurrency';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { addToCart, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import ModalOverlay from '../../components/common/ModalOverlay';

const PublicMenuPage: React.FC = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table');
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const { items, totalAmount, placeId } = cart;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      setProducts((data || []).filter(p => p.isActive));
    } catch (err) {
      console.error('Menü çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Hepsi', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Hepsi' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: ProductDto) => {
    dispatch(addToCart({
      productId: product.id!,
      productName: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl
    }));
  };

  const handleRemoveFromCart = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const getItemQuantity = (productId: number) => {
    const item = items.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !placeId) return;

    try {
      setIsOrdering(true);
      await ordersService.create({
        placeId: placeId,
        orderItems: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        totalAmount: totalAmount,
        note: orderNote,
        paymentMethod: 'CASH', // Varsayılan
        status: 'PENDING'
      });
      
      setOrderSuccess(true);
      dispatch(clearCart());
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
      }, 3000);
    } catch (err: any) {
      console.error('Sipariş hatası detayı:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Bilinmeyen bir hata';
      const errorStatus = err.response?.status;
      alert(`Sipariş Hatası (${errorStatus}): ${errorMessage}`);
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Dynamic Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-10 shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dijital Menü</h1>
            {table && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{table}</p>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 relative">
            <ShoppingBag className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {items.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Lezzet keşfine çık..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium transition-all outline-none"
          />
        </div>
      </div>

      {/* Horizontal Categories */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-tighter
              ${activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-6 space-y-4 mt-2">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const qty = getItemQuantity(product.id!);
            return (
              <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex gap-5 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="w-28 h-28 bg-slate-50 rounded-3xl overflow-hidden flex-shrink-0 border border-slate-50">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Coffee className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-800 leading-tight text-lg tracking-tight">{product.name}</h3>
                      <div className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        <span className="text-[10px] font-black">4.9</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 font-medium leading-relaxed">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-blue-600 font-black text-xl tracking-tighter">{formatTryCurrency(product.price)}</span>
                    
                    <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                      {qty > 0 && (
                        <>
                          <button 
                            onClick={() => handleRemoveFromCart(product.id!)}
                            className="w-8 h-8 bg-white text-slate-900 rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-black text-sm w-4 text-center">{qty}</span>
                        </>
                      )}
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-transform
                          ${qty > 0 ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}
                        `}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search className="h-10 w-10" />
            </div>
            <p className="text-slate-400 font-bold italic tracking-tight">Aradığınız lezzet şu an bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {items.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
          <button 
            onClick={() => setShowCheckout(true)}
            className="w-full bg-blue-600 text-white py-4.5 rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center justify-between px-8 hover:bg-blue-700 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-xl text-xs backdrop-blur-md">
                {items.reduce((sum, i) => sum + i.quantity, 0)} Ürün
              </div>
              <span className="uppercase tracking-widest text-xs">Siparişi Görüntüle</span>
            </div>
            <span className="text-lg">{formatTryCurrency(totalAmount)}</span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <ModalOverlay>
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            {orderSuccess ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Afiyet Olsun!</h2>
                  <p className="text-slate-500 font-medium mt-2">Siparişiniz mutfağa iletildi.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sipariş Özeti</h2>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                          {item.quantity}x
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{item.productName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatTryCurrency(item.unitPrice)}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-sm">{formatTryCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Mutfak Notu</label>
                    <textarea 
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Örn: Acısız olsun, buzlu gelsin..."
                      className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl py-4 px-5 text-sm font-medium transition-all outline-none min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2rem]">
                    <div>
                      <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Toplam Tutar</p>
                      <p className="text-2xl font-black tracking-tighter">{formatTryCurrency(totalAmount)}</p>
                    </div>
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isOrdering}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                      {isOrdering ? 'Gönderiliyor...' : 'Siparişi Ver'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default PublicMenuPage;
