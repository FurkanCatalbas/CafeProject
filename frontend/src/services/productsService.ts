import api from './authService';
import { unwrapApiData } from './apiResponse';

export interface ProductDto {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

const resolvePersistedProduct = async (payload: ProductDto) => {
  if (payload?.id) {
    const response = await api.get(`/product-service/api/products/${payload.id}`);
    return unwrapApiData<ProductDto>(response.data);
  }

  return payload;
};

export const productsService = {
  getAll: async () => {
    const response = await api.get('/product-service/api/products');
    return unwrapApiData<ProductDto[]>(response.data);
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/product-service/api/products/${id}`);
    return unwrapApiData<ProductDto>(response.data);
  },
  
  create: async (productData: ProductDto) => {
    const response = await api.post('/product-service/api/products', productData);
    const payload = unwrapApiData<ProductDto>(response.data);
    return resolvePersistedProduct(payload);
  },
  
  update: async (productData: ProductDto) => {
    const response = await api.put('/product-service/api/products', productData);
    const payload = unwrapApiData<ProductDto>(response.data);
    return resolvePersistedProduct(payload);
  },
  
  delete: async (id: number) => {
    await api.delete(`/product-service/api/products/${id}`);
  },
  
  getByCategory: async (category: string) => {
    const response = await api.get(`/product-service/api/products/category/${category}`);
    return unwrapApiData<ProductDto[]>(response.data);
  },
};
