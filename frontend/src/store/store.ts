import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import placesReducer from './slices/placesSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    places: placesReducer,
    products: productsReducer,
    orders: ordersReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
