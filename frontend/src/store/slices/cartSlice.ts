import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  placeId: number | null;
  placeName: string | null;
}

const loadCartFromStorage = (): Partial<CartState> => {
  try {
    const savedCart = localStorage.getItem('cafe_cart');
    return savedCart ? JSON.parse(savedCart) : {};
  } catch (e) {
    return {};
  }
};

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  placeId: null,
  placeName: null,
  ...loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity' | 'totalPrice'>>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1,
          totalPrice: action.payload.unitPrice,
        });
      }
      
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      localStorage.setItem('cafe_cart', JSON.stringify(state));
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      const existingItem = state.items.find(item => item.productId === action.payload);
      
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
        } else {
          state.items = state.items.filter(item => item.productId !== action.payload);
        }
      }
      
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      localStorage.setItem('cafe_cart', JSON.stringify(state));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      localStorage.removeItem('cafe_cart');
    },
    setPlace: (state, action: PayloadAction<{ id: number; name: string }>) => {
      state.placeId = action.payload.id;
      state.placeName = action.payload.name;
      localStorage.setItem('cafe_cart', JSON.stringify(state));
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setPlace } = cartSlice.actions;
export default cartSlice.reducer;
