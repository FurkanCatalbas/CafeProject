import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { productsService } from '../../services/productsService';
import ModalOverlay from '../../components/common/ModalOverlay';
import { formatTryCurrency } from '../../utils/formatTryCurrency';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    isActive: true,
  });
  const [editProduct, setEditProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    isActive: true,
  });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsService.getAll();
      setProducts(
        (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price ?? 0),
          stock: item.stock ?? 0,
          category: item.category ?? '',
          imageUrl: item.imageUrl ?? '',
          isActive: Boolean(item.isActive),
        }))
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ürünler backend tarafından alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      category: '',
      description: '',
      price: '',
      stock: '',
      isActive: true,
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setIsSubmitting(false);
    resetNewProduct();
  };

  const handleCreateProduct = async () => {
    const parsedPrice = Number(newProduct.price);
    const parsedStock = Number(newProduct.stock);

    if (!newProduct.name.trim() || !newProduct.category.trim() || !Number.isFinite(parsedPrice) || !Number.isFinite(parsedStock)) {
      setError('Ürün oluşturmak için ad, kategori, fiyat ve stok zorunludur.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await productsService.create({
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        description: newProduct.description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        imageUrl: '',
        isActive: newProduct.isActive,
      });
      await loadProducts();
      closeCreateModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ürün oluşturulamadı.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const confirmed = window.confirm('Bu ürünü silmek istiyor musunuz?');
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await productsService.delete(id);
      await loadProducts();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ürün silinemedi.');
    }
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditProduct({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      isActive: product.isActive,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProductId(null);
    setIsSubmitting(false);
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) {
      return;
    }

    const parsedPrice = Number(editProduct.price);
    const parsedStock = Number(editProduct.stock);
    if (!editProduct.name.trim() || !editProduct.category.trim() || !Number.isFinite(parsedPrice) || !Number.isFinite(parsedStock)) {
      setError('Ürün güncellemek için ad, kategori, fiyat ve stok zorunludur.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await productsService.update({
        id: editingProductId,
        name: editProduct.name.trim(),
        category: editProduct.category.trim(),
        description: editProduct.description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        imageUrl: '',
        isActive: editProduct.isActive,
      });
      await loadProducts();
      closeEditModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ürün güncellenemedi.');
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürünler</h1>
          <p className="text-gray-600">Kafe menünüzü yönetin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ürün Ekle
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Ürünlerde ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Ürün Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card">
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-primary-500">{formatTryCurrency(product.price)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.isActive
                  ? 'bg-green-900/50 text-green-300'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {product.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span className="text-gray-600">Stok: {product.stock}</span>
              <span className="text-gray-600">{product.category}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenEditProduct(product)}
                className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Ürün bulunamadı.
          </div>
        )}
      </div>

      {/* Ürün Ekleme Modalı */}
      {showCreateModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Ürün Ekle</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ürün Adı"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                />
                <select
                  className="input-field"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Kategori Seçin</option>
                  <option value="KAHVE">Kahve</option>
                  <option value="HAMUR_ISI">Hamur İşi</option>
                  <option value="SANDVIC">Sandviç</option>
                  <option value="TATLI">Tatlı</option>
                </select>
              </div>
              <textarea
                placeholder="Açıklama"
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                className="input-field w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Fiyat (₺)"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Stok"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  checked={newProduct.isActive}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-gray-700">Aktif</label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCreateModal}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateProduct}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Ürün Ekle'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showEditModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Düzenle</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ürün Adı"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Kategori"
                  value={editProduct.category}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                />
              </div>
              <textarea
                placeholder="Açıklama"
                rows={3}
                value={editProduct.description}
                onChange={(e) => setEditProduct((prev) => ({ ...prev, description: e.target.value }))}
                className="input-field w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Fiyat (₺)"
                  step="0.01"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, price: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Stok"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, stock: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editIsActive"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  checked={editProduct.isActive}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="editIsActive" className="text-gray-700">Aktif</label>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={closeEditModal} className="btn-secondary">
                  İptal
                </button>
                <button
                  onClick={handleUpdateProduct}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Güncelleniyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ProductsPage;
