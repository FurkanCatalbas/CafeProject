import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsService, ProductDto } from '../../services/productsService';
import { Search, ShoppingBag, ChevronRight, Star, RefreshCw, Coffee } from 'lucide-react';
import { formatTryCurrency } from '../../utils/formatTryCurrency';

const PublicMenuPage: React.FC = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      // Sadece aktif ürünleri göster
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
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
            <ShoppingBag className="h-5 w-5" />
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
          filteredProducts.map(product => (
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
                  <button className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
        <button className="w-full bg-blue-600 text-white py-4.5 rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 hover:bg-blue-700 transition-all active:scale-95">
          <span className="uppercase tracking-widest text-xs">Siparişi Görüntüle</span>
          <div className="bg-white/20 px-3 py-1 rounded-xl text-xs backdrop-blur-md">0 Ürün</div>
        </button>
      </div>
    </div>
  );
};

export default PublicMenuPage;
