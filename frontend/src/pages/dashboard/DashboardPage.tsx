import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  MapPin, 
  Package, 
  ShoppingCart
} from 'lucide-react';
import { usersService } from '../../services/usersService';
import type { UserDto } from '../../services/usersService';
import { placesService } from '../../services/placesService';
import { productsService } from '../../services/productsService';
import { OrderDto, ordersService } from '../../services/ordersService';
import { formatTryCurrency } from '../../utils/formatTryCurrency';

interface TopProduct {
  name: string;
  sales: number;
}

interface DashboardStats {
  totalUsers: number;
  totalPlaces: number;
  totalProducts: number;
  totalOrders: number;
  activeOrders: number;
  todayRevenue: number;
}

interface JwtClaims {
  sub?: string;
}

const getOrderStatusLabel = (status?: string) => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'PREPARING': return 'Hazırlanıyor';
    case 'READY': return 'Hazır';
    case 'DELIVERED': return 'Teslim Edildi';
    case 'CANCELLED': return 'İptal Edildi';
    case 'ORDER_RECEIVED': return 'Sipariş Alındı';
    case 'SERVED': return 'Servis Edildi';
    case 'WAITING_PAYMENT': return 'Ödeme Bekleniyor';
    case 'PAID': return 'Ödendi';
    default: return status ?? '-';
  }
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPlaces: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    todayRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [welcomeName, setWelcomeName] = useState('Kullanıcı');

  const getTokenClaims = (): JwtClaims => {
    const token = localStorage.getItem('token');
    if (!token) {
      return {};
    }

    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      return {};
    }

    try {
      const decoded = JSON.parse(window.atob(tokenParts[1]));
      return decoded as JwtClaims;
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      const [
        usersResult,
        placesResult,
        productsResult,
        ordersResult,
        activeOrdersResult,
        summaryResult,
        recentResult,
      ] =
        await Promise.allSettled([
          usersService.getAll(),
          placesService.getAll(),
          productsService.getAll(),
          ordersService.getAll(),
          ordersService.getActive(),
          ordersService.getDashboardSummary(),
          ordersService.getRecent(),
        ]);

      const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
      const places = placesResult.status === 'fulfilled' ? placesResult.value : [];
      const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
      const activeOrders = activeOrdersResult.status === 'fulfilled' ? activeOrdersResult.value : [];
      const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const recent = recentResult.status === 'fulfilled' ? recentResult.value : [];
      const dashboardRecent = summary?.recentOrders && summary.recentOrders.length > 0 ? summary.recentOrders : recent;

      if (
        usersResult.status === 'rejected' &&
        placesResult.status === 'rejected' &&
        productsResult.status === 'rejected' &&
        ordersResult.status === 'rejected' &&
        activeOrdersResult.status === 'rejected' &&
        recentResult.status === 'rejected'
      ) {
        setError('Panel verileri backend servislerinden alınamadı.');
      }

      const productSalesMap = new Map<string, number>();
      dashboardRecent.forEach((order) => {
        order.orderItems?.forEach((item) => {
          const current = productSalesMap.get(item.productName) ?? 0;
          productSalesMap.set(item.productName, current + item.quantity);
        });
      });

      const rankedProducts = Array.from(productSalesMap.entries())
        .map(([name, sales]) => ({
          name,
          sales,
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4);

      setRecentOrders(dashboardRecent.slice(0, 4));
      setTopProducts(rankedProducts);

      const authenticatedUsername = getTokenClaims().sub;
      const matchedUser =
        users.find((u: UserDto) => u.username === authenticatedUsername) ||
        users.find((u: UserDto) => u.emailAddress === authenticatedUsername);
      const fullNameFromUser = [matchedUser?.firstName, matchedUser?.lastName].filter(Boolean).join(' ').trim();
      const fullNameFromContext = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
      const resolvedName =
        fullNameFromContext ||
        fullNameFromUser ||
        matchedUser?.username ||
        authenticatedUsername ||
        'Kullanıcı';
      setWelcomeName(resolvedName);

      setStats({
        totalUsers: users.length,
        totalPlaces: places.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        activeOrders: summary?.activeOrderCount ?? activeOrders.length,
        todayRevenue: Number(summary?.totalRevenue ?? 0),
      });
      setLoading(false);
    };

    loadDashboard();
  }, [user?.firstName, user?.lastName]);

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-600',
      detail: 'Kayıtlı kullanıcı',
    },
    {
      title: 'Toplam Masa',
      value: stats.totalPlaces,
      icon: MapPin,
      color: 'bg-green-600',
      detail: 'Kayıtlı mekan',
    },
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-600',
      detail: 'Kayıtlı ürün',
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-orange-600',
      detail:
        stats.totalOrders > 0
          ? `%${Math.round((stats.activeOrders / stats.totalOrders) * 100)} aktif`
          : 'Aktif sipariş yok',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hoşgeldiniz, {welcomeName}!</h1>
            <p className="mt-1 text-sm text-gray-600">Kafe yönetim sisteminizdeki genel durum özeti.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              data-testid="dashboard-new-order"
              className="btn-primary"
            >
              Yeni Sipariş
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{stat.detail}</span>
                </div>
                <h3 className="text-[32px] font-bold leading-none text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm mt-2">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Grafikler ve Hareketler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Ciro grafiği */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Ciro Özeti</h3>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Ciro grafiği burada gösterilecek</p>
            </div>
          </div>

          {/* Son Hareketler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Hareketler</h3>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Sipariş #{order.id} durumu: {getOrderStatusLabel(order.status)}</p>
                    <p className="text-xs text-gray-500 mt-1">Masa #{order.placeId} - Kullanıcı #{order.userId}</p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-gray-500">Son hareket bulunamadı.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tablolar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Son Siparişler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                data-testid="dashboard-view-all-orders"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Tümünü gör
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Sipariş No</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Müşteri</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Tutar</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm text-gray-900">#{order.id}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">Kullanıcı #{order.userId}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">{formatTryCurrency(Number(order.totalAmount ?? 0))}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-2 text-sm text-gray-500 text-center">
                        Son sipariş bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* En Çok Satan Ürünler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">En Çok Satan Ürünler</h3>
              <button
                type="button"
                onClick={() => navigate('/products')}
                data-testid="dashboard-view-all-products"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Tümünü gör
              </button>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} satış</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Toplam adet: {product.sales}</p>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-sm text-gray-500">Ürün satış verisi bulunamadı.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
