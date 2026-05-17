import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsService, ProductDto } from '../../services/productsService';

interface ProductsState {
  products: ProductDto[];
  currentProduct: ProductDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const products = await productsService.getAll();
      return products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ürünler alınamadı');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: ProductDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const product = await productsService.create(productData);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ürün oluşturulamadı');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (productData: ProductDto, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const product = await productsService.update(productData);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ürün güncellenemedi');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state: ProductsState) => {
      state.error = null;
    },
    setCurrentProduct: (state: ProductsState, action: PayloadAction<ProductDto | null>) => {
      state.currentProduct = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchProducts.pending, (state: ProductsState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state: ProductsState, action: any) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state: ProductsState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.pending, (state: ProductsState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state: ProductsState, action: any) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state: ProductsState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProduct.pending, (state: ProductsState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state: ProductsState, action: any) => {
        state.loading = false;
        const index = state.products.findIndex((product: ProductDto) => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state: ProductsState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
