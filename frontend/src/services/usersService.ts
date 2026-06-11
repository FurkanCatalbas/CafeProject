import api from './authService';
import { unwrapApiData } from './apiResponse';

export interface UserDto {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  roleName: 'ADMIN' | 'MANAGER' | 'WAITER' | 'CASHIER' | 'CUSTOMER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  type?: number;
  password?: string;
}

export const usersService = {
  getAll: async () => {
    const response = await api.get('/auth-service/api/admin/users');
    return unwrapApiData<UserDto[]>(response.data);
  },

  getById: async (id: number) => {
    const response = await api.get(`/user-service/api/users/${id}`);
    return unwrapApiData<UserDto>(response.data);
  },

  create: async (userData: UserDto) => {
    const response = await api.post('/auth-service/api/admin/users', userData);
    return unwrapApiData<UserDto>(response.data);
  },

  update: async (userData: UserDto) => {
    const response = await api.put(`/auth-service/api/admin/users/${userData.id}`, userData);
    return unwrapApiData<UserDto>(response.data);
  },

  delete: async (id: number) => {
    await api.delete(`/auth-service/api/admin/users/${id}`);
  },
};
