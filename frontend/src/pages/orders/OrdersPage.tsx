import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Banknote,
} from 'lucide-react';
import { ordersService } from '../../services/ordersService';
import ModalOverlay from '../../components/common/ModalOverlay';
import { formatTryCurrency } from '../../utils/formatTryCurrency';

interface Order {
  id: number;
  userId: number;
  placeId: number;
  orderDate: string;
  totalAmount: number;
  status: 'PENDING' | 'ORDER_RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'WAITING_PAYMENT' | 'DELIVERED' | 'CANCELLED' | 'PAID';
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED' | 'FAILED';
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
  userName: string;
  placeName: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: number;
  productId?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const mapOrderListItem = (item: any): Order => ({
  id: item.id,
  userId: item.userId ?? 0,
  placeId: item.placeId ?? 0,
  orderDate: item.orderDate,
  totalAmount: Number(item.totalAmount ?? 0),
  status: item.status ?? 'PENDING',
  paymentStatus: item.paymentStatus ?? 'UNPAID',
  paymentMethod: item.paymentMethod ?? 'CASH',
  userName: `Kullanıcı #${item.userId ?? '-'}`,
  placeName: `Masa #${item.placeId ?? '-'}`,
  orderItems: item.orderItems ?? [],
});

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePlaceIdFilter, setActivePlaceIdFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingOrderBaseline, setEditingOrderBaseline] = useState<{
    status: Order['status'];
    paymentStatus: Order['paymentStatus'];
  } | null>(null);
  const [newOrder, setNewOrder] = useState({
    placeId: '',
    paymentMethod: 'CASH' as Order['paymentMethod'],
    note: '',
    productId: '',
    productName: '',
    quantity: '1',
    unitPrice: '',
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersService.getAll();
      setOrders((data || []).map(mapOrderListItem));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Siparişler backend tarafından alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActiveOrdersByPlace = async () => {
    const parsedPlaceId = Number(activePlaceIdFilter);
    if (!Number.isFinite(parsedPlaceId) || parsedPlaceId <= 0) {
      setError('Aktif siparişleri getirmek için geçerli bir masa numarası girin.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ordersService.getActiveByPlaceId(parsedPlaceId);
      setOrders((data || []).map(mapOrderListItem));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Masa bazlı aktif siparişler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const resetActiveOrdersByPlaceFilter = async () => {
    setActivePlaceIdFilter('');
    await loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const resetNewOrder = () => {
    setNewOrder({
      placeId: '',
      paymentMethod: 'CASH',
      note: '',
      productId: '',
      productName: '',
      quantity: '1',
      unitPrice: '',
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setIsSubmitting(false);
    resetNewOrder();
  };

  const handleCreateOrder = async () => {
    const placeId = Number(newOrder.placeId);
    const hasItemData = Boolean(newOrder.productId || newOrder.productName || newOrder.unitPrice);
    const productId = Number(newOrder.productId);
    const quantity = Number(newOrder.quantity);
    const unitPrice = Number(newOrder.unitPrice);

    if (!Number.isFinite(placeId) || placeId <= 0) {
      setError('Sipariş oluşturmak için geçerli bir masa numarası girin.');
      return;
    }

    if (
      hasItemData &&
      (!Number.isFinite(productId) ||
        productId <= 0 ||
        !newOrder.productName.trim() ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0)
    ) {
      setError('Ürün satırı girildiyse ürün numarası, ad, adet ve birim fiyat zorunludur.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await ordersService.create({
        userId: 0,
        placeId,
        orderDate: new Date().toISOString(),
        totalAmount: 0,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: newOrder.paymentMethod,
        note: newOrder.note.trim() || undefined,
        orderItems: hasItemData
          ? [
              {
                productId,
                productName: newOrder.productName.trim(),
                quantity,
                unitPrice,
                totalPrice: quantity * unitPrice,
              },
            ]
          : [],
      });
      await loadOrders();
      closeCreateModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sipariş oluşturulamadı.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    const confirmed = window.confirm('Bu siparişi silmek istiyor musunuz?');
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await ordersService.delete(id);
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sipariş silinemedi.');
    }
  };

  const handleOpenOrderDetails = async (id: number) => {
    setError(null);
    try {
      const order = await ordersService.getById(id);
      setSelectedOrder({
        id: order.id || id,
        userId: order.userId ?? 0,
        placeId: order.placeId,
        orderDate: order.orderDate ?? '',
        totalAmount: Number(order.totalAmount ?? 0),
        status: (order.status ?? 'PENDING') as Order['status'],
        paymentStatus: (order.paymentStatus ?? 'UNPAID') as Order['paymentStatus'],
        paymentMethod: (order.paymentMethod ?? 'CASH') as Order['paymentMethod'],
        userName: `Kullanıcı #${order.userId ?? '-'}`,
        placeName: `Masa #${order.placeId ?? '-'}`,
        orderItems: (order.orderItems ?? []).map((item) => ({
          id: item.id ?? 0,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice ?? 0),
          totalPrice: Number(item.totalPrice ?? 0),
        })),
      });
      setShowDetailsModal(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sipariş detayı alınamadı.');
    }
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditingOrderBaseline({
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingOrder(null);
    setEditingOrderBaseline(null);
    setIsSubmitting(false);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder || !editingOrderBaseline) {
      return;
    }

    const statusChanged = editingOrder.status !== editingOrderBaseline.status;
    const paymentStatusChanged = editingOrder.paymentStatus !== editingOrderBaseline.paymentStatus;
    if (!statusChanged && !paymentStatusChanged) {
      closeEditModal();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (statusChanged) {
        await ordersService.updateStatus(editingOrder.id, editingOrder.status);
      }
      if (paymentStatusChanged) {
        await ordersService.updatePaymentStatus(editingOrder.id, editingOrder.paymentStatus);
      }
      await loadOrders();
      closeEditModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sipariş güncellenemedi.');
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-600';
      case 'ORDER_RECEIVED': return 'bg-yellow-500';
      case 'PREPARING': return 'bg-blue-600';
      case 'READY': return 'bg-green-600';
      case 'SERVED': return 'bg-teal-600';
      case 'WAITING_PAYMENT': return 'bg-orange-600';
      case 'DELIVERED': return 'bg-gray-600';
      case 'CANCELLED': return 'bg-red-600';
      case 'PAID': return 'bg-emerald-700';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'ORDER_RECEIVED': return Clock;
      case 'PREPARING': return Clock;
      case 'READY': return CheckCircle;
      case 'SERVED': return CheckCircle;
      case 'WAITING_PAYMENT': return Banknote;
      case 'DELIVERED': return CheckCircle;
      case 'CANCELLED': return XCircle;
      case 'PAID': return CheckCircle;
      default: return Clock;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'ORDER_RECEIVED': return 'Sipariş Alındı';
      case 'PREPARING': return 'Hazırlanıyor';
      case 'READY': return 'Hazır';
      case 'SERVED': return 'Servis Edildi';
      case 'WAITING_PAYMENT': return 'Ödeme Bekleniyor';
      case 'DELIVERED': return 'Teslim Edildi';
      case 'CANCELLED': return 'İptal Edildi';
      case 'PAID': return 'Ödendi';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (paymentMethod: Order['paymentMethod']) => {
    switch (paymentMethod) {
      case 'CASH': return 'Nakit';
      case 'CARD': return 'Kart';
      case 'ONLINE': return 'Çevrimiçi';
      default: return paymentMethod;
    }
  };

  const getPaymentStatusLabel = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'PAID': return 'Ödendi';
      case 'UNPAID': return 'Ödenmedi';
      case 'REFUNDED': return 'İade';
      case 'FAILED': return 'Başarısız';
      default: return paymentStatus;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişler</h1>
          <p className="text-gray-600">Kafe siparişlerinizi yönetin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Sipariş
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Filtreler */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
            placeholder="Siparişlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="ORDER_RECEIVED">Sipariş Alındı</option>
            <option value="PREPARING">Hazırlanıyor</option>
            <option value="READY">Hazır</option>
            <option value="SERVED">Servis Edildi</option>
            <option value="WAITING_PAYMENT">Ödeme Bekleniyor</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="CANCELLED">İptal Edildi</option>
            <option value="PAID">Ödendi</option>
          </select>
        </div>
        <div className="flex-1 relative">
          <input
            type="number"
            min={1}
            placeholder="Masa numarası ile aktif sipariş getir"
            value={activePlaceIdFilter}
            onChange={(e) => setActivePlaceIdFilter(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadActiveOrdersByPlace}
            className="btn-secondary"
          >
            Aktif Siparişleri Getir
          </button>
          <button
            onClick={resetActiveOrdersByPlaceFilter}
            className="btn-secondary"
          >
            Listeyi Sıfırla
          </button>
        </div>
      </div>

      {/* Sipariş Tablosu */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Sipariş No</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Müşteri</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Masa</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Tutar</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Durum</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Ödeme</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-4 text-gray-900">#{order.id}</td>
                  <td className="py-2.5 px-4 text-gray-900">{order.userName}</td>
                  <td className="py-2.5 px-4 text-gray-900">{order.placeName}</td>
                  <td className="py-2.5 px-4 text-gray-900">{formatTryCurrency(order.totalAmount)}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4 text-gray-400" />
                      <div className={`w-2 h-2 ${getStatusColor(order.status)} rounded-full`}></div>
                      <span className="text-gray-800">{getStatusLabel(order.status)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{getPaymentMethodLabel(order.paymentMethod)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenOrderDetails(order.id)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditOrder(order)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 px-4 text-center text-sm text-gray-500">
                  Sipariş bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sipariş Oluşturma Modalı */}
      {showCreateModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Sipariş Oluştur</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min={1}
                  placeholder="Masa numarası"
                  value={newOrder.placeId}
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, placeId: e.target.value }))}
                  className="input-field"
                />
                <select
                  className="input-field"
                  value={newOrder.paymentMethod}
                  onChange={(e) => setNewOrder((prev) => ({ ...prev, paymentMethod: e.target.value as Order['paymentMethod'] }))}
                >
                  <option value="CASH">Nakit</option>
                  <option value="CARD">Kart</option>
                  <option value="ONLINE">Çevrimiçi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Kalemleri</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Ürün numarası"
                      value={newOrder.productId}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, productId: e.target.value }))}
                      className="input-field w-24"
                    />
                    <input
                      type="text"
                      placeholder="Ürün Adı"
                      value={newOrder.productName}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, productName: e.target.value }))}
                      className="input-field flex-1"
                    />
                    <input
                      type="number"
                      placeholder="Adet"
                      min={1}
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, quantity: e.target.value }))}
                      className="input-field w-20"
                    />
                    <input
                      type="number"
                      placeholder="Birim fiyat (₺)"
                      min={0}
                      step="0.01"
                      value={newOrder.unitPrice}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, unitPrice: e.target.value }))}
                      className="input-field w-24"
                    />
                  </div>
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Not (opsiyonel)"
                value={newOrder.note}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, note: e.target.value }))}
                className="input-field w-full"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCreateModal}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showDetailsModal && selectedOrder && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Detayı #{selectedOrder.id}</h2>
            <div className="space-y-2 text-gray-800">
              <p>Müşteri: {selectedOrder.userName}</p>
              <p>Masa: {selectedOrder.placeName}</p>
              <p>Durum: {getStatusLabel(selectedOrder.status)}</p>
              <p>Ödeme Durumu: {getPaymentStatusLabel(selectedOrder.paymentStatus)}</p>
              <p>Ödeme Yöntemi: {getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
              <p>Tutar: {formatTryCurrency(selectedOrder.totalAmount)}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Kalemler</h3>
              <div className="space-y-2">
                {selectedOrder.orderItems.map((item) => (
                  <div key={`${item.id}-${item.productName}`} className="flex justify-between text-sm text-gray-700">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>{formatTryCurrency(Number(item.totalPrice))}</span>
                  </div>
                ))}
                {selectedOrder.orderItems.length === 0 && (
                  <p className="text-sm text-gray-500">Kalem bulunamadı.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-secondary"
              >
                Kapat
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showEditModal && editingOrder && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Düzenle #{editingOrder.id}</h2>
            <div className="space-y-4">
              <select
                className="input-field w-full"
                value={editingOrder.status}
                onChange={(e) =>
                  setEditingOrder((prev) =>
                    prev ? { ...prev, status: e.target.value as Order['status'] } : prev
                  )
                }
              >
                <option value="PENDING">Beklemede</option>
                <option value="ORDER_RECEIVED">Sipariş Alındı</option>
                <option value="PREPARING">Hazırlanıyor</option>
                <option value="READY">Hazır</option>
                <option value="SERVED">Servis Edildi</option>
                <option value="WAITING_PAYMENT">Ödeme Bekleniyor</option>
                <option value="DELIVERED">Teslim Edildi</option>
                <option value="CANCELLED">İptal Edildi</option>
                <option value="PAID">Ödendi</option>
              </select>
              <select
                className="input-field w-full"
                value={editingOrder.paymentStatus}
                onChange={(e) =>
                  setEditingOrder((prev) =>
                    prev ? { ...prev, paymentStatus: e.target.value as Order['paymentStatus'] } : prev
                  )
                }
              >
                <option value="UNPAID">Ödenmedi</option>
                <option value="PAID">Ödendi</option>
                <option value="REFUNDED">İade</option>
                <option value="FAILED">Başarısız</option>
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={closeEditModal} className="btn-secondary">
                  İptal
                </button>
                <button
                  onClick={handleUpdateOrder}
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

export default OrdersPage;
