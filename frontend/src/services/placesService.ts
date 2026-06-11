import api from './authService';
import { unwrapApiData } from './apiResponse';

export interface PlaceDto {
  id?: number;
  name: string;
  managerId: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLOSED';
  qrCode?: string;
}

const resolvePersistedPlace = async (payload: PlaceDto) => {
  if (payload?.id) {
    const response = await api.get(`/place-service/api/places/${payload.id}`);
    return unwrapApiData<PlaceDto>(response.data);
  }

  return payload;
};

export const placesService = {
  getAll: async () => {
    const response = await api.get('/place-service/api/places');
    return unwrapApiData<PlaceDto[]>(response.data);
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/place-service/api/places/${id}`);
    return unwrapApiData<PlaceDto>(response.data);
  },

  getPublicByQr: async (qrCode: string) => {
    const response = await api.get(`/place-service/api/places/public/qr/${qrCode}`);
    return unwrapApiData<PlaceDto>(response.data);
  },
  
  create: async (placeData: PlaceDto) => {
    const response = await api.post('/place-service/api/places', placeData);
    const payload = unwrapApiData<PlaceDto>(response.data);
    return resolvePersistedPlace(payload);
  },
  
  update: async (placeData: PlaceDto) => {
    const response = await api.put('/place-service/api/places', placeData);
    const payload = unwrapApiData<PlaceDto>(response.data);
    return resolvePersistedPlace(payload);
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/place-service/api/places/${id}/status/${status}`);
    return unwrapApiData<PlaceDto>(response.data);
  },
  
  close: async (id: number) => {
    const response = await api.patch(`/place-service/api/places/${id}/close`);
    return unwrapApiData<PlaceDto>(response.data);
  },
  
  delete: async (id: number) => {
    await api.delete(`/place-service/api/places/${id}`);
  },
  
  getByStatus: async (status: string) => {
    const response = await api.get(`/place-service/api/places/status/${status}`);
    return unwrapApiData<PlaceDto[]>(response.data);
  },
};
