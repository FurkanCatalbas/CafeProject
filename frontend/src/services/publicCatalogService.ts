import publicApi from './publicApi';
import { unwrapApiData } from './apiResponse';
import type { PlaceDto } from './placesService';
import type { ProductDto } from './productsService';
import type { OrderDto } from './ordersService';

export const publicCatalogService = {
  getPlaceById: async (id: number) => {
    const response = await publicApi.get(`/place-service/api/places/${id}`);
    return unwrapApiData<PlaceDto>(response.data);
  },

  getProducts: async () => {
    const response = await publicApi.get('/product-service/api/products');
    return unwrapApiData<ProductDto[]>(response.data);
  },

  createOrder: async (orderData: OrderDto) => {
    const response = await publicApi.post('/order-service/api/orders', orderData);
    return unwrapApiData<OrderDto>(response.data);
  },
};
