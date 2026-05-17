import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersService, OrderDto } from '../../services/ordersService';

interface OrdersState {
  orders: OrderDto[];
  currentOrder: OrderDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const orders = await ordersService.getAll();
      return orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Siparişler alınamadı');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: OrderDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const order = await ordersService.create(orderData);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sipariş oluşturulamadı');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (orderData: OrderDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const order = await ordersService.update(orderData);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Sipariş güncellenemedi');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state: OrdersState) => {
      state.error = null;
    },
    setCurrentOrder: (state: OrdersState, action: PayloadAction<OrderDto | null>) => {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchOrders.pending, (state: OrdersState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state: OrdersState, action: any) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state: OrdersState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createOrder.pending, (state: OrdersState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state: OrdersState, action: any) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state: OrdersState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrder.pending, (state: OrdersState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state: OrdersState, action: any) => {
        state.loading = false;
        const index = state.orders.findIndex((order: OrderDto) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state: OrdersState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
