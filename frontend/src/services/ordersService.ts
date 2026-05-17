import api from './authService';
import { unwrapApiData } from './apiResponse';

export interface OrderDto {
  id?: number;
  userId?: number;
  placeId: number;
  orderDate?: string;
  completedDate?: string;
  totalAmount?: number;
  status?: 'PENDING' | 'ORDER_RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'WAITING_PAYMENT' | 'DELIVERED' | 'CANCELLED' | 'PAID';
  paymentStatus?: 'PAID' | 'UNPAID' | 'REFUNDED' | 'FAILED';
  paymentMethod?: 'CASH' | 'CARD' | 'ONLINE';
  note?: string;
  orderItems?: OrderItemDto[];
}

export interface OrderItemDto {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DashboardSummaryDto {
  activeOrderCount: number;
  waitingPaymentCount: number;
  completedOrderCount: number;
  totalRevenue: number;
  recentOrders: OrderDto[];
}

export const ordersService = {
  getAll: async () => {
    const response = await api.get('/order-service/api/orders');
    return unwrapApiData<OrderDto[]>(response.data);
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/order-service/api/orders/${id}`);
    return unwrapApiData<OrderDto>(response.data);
  },
  
  create: async (orderData: OrderDto) => {
    const response = await api.post('/order-service/api/orders', orderData);
    return unwrapApiData<OrderDto>(response.data);
  },
  
  update: async (orderData: OrderDto) => {
    const response = await api.put('/order-service/api/orders', orderData);
    return unwrapApiData<OrderDto>(response.data);
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/order-service/api/orders/${id}/status/${status}`);
    return unwrapApiData<OrderDto>(response.data);
  },
  
  updatePaymentStatus: async (id: number, paymentStatus: string) => {
    const response = await api.patch(`/order-service/api/orders/${id}/payment-status/${paymentStatus}`);
    return unwrapApiData<OrderDto>(response.data);
  },
  
  close: async (id: number, paymentMethod: string) => {
    const response = await api.patch(`/order-service/api/orders/${id}/close/${paymentMethod}`);
    return unwrapApiData<OrderDto>(response.data);
  },
  
  delete: async (id: number) => {
    await api.delete(`/order-service/api/orders/${id}`);
  },
  
  getActive: async () => {
    const response = await api.get('/order-service/api/orders/active');
    return unwrapApiData<OrderDto[]>(response.data);
  },

  getActiveByPlaceId: async (placeId: number) => {
    const response = await api.get(`/order-service/api/orders/place/${placeId}/active`);
    return unwrapApiData<OrderDto[]>(response.data);
  },
  
  getMyOrders: async () => {
    const response = await api.get('/order-service/api/orders/my-orders');
    return unwrapApiData<OrderDto[]>(response.data);
  },
  
  getDashboardSummary: async () => {
    const response = await api.get('/order-service/api/orders/dashboard/summary');
    return unwrapApiData<DashboardSummaryDto>(response.data);
  },

  getRecent: async () => {
    const response = await api.get('/order-service/api/orders/recent');
    return unwrapApiData<OrderDto[]>(response.data);
  },
};
