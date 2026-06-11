import api from './authService';
import { unwrapApiData } from './apiResponse';

export interface UserDto {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  roleName: 'ADMIN' | 'MANAGER' | 'WAITER' | 'CASHIER' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  type: number;
  password?: string;
  businessCode?: string;
  businessName?: string;
}

const getCurrentBusinessCode = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload?.userObject?.businessCode || '';
  } catch {
    return '';
  }
};

const resolvePersistedUser = async (payload: UserDto) => {
  if (payload?.id) {
    const response = await api.get(`/user-service/api/users/${payload.id}`);
    return unwrapApiData<UserDto>(response.data);
  }

  return payload;
};

export const usersService = {
  getAll: async () => {
    const response = await api.get('/user-service/api/users');
    return unwrapApiData<UserDto[]>(response.data);
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/user-service/api/users/${id}`);
    return unwrapApiData<UserDto>(response.data);
  },
  
  create: async (userData: UserDto) => {
    const businessCode = userData.businessCode || getCurrentBusinessCode();
    await api.post('/auth-service/api/auth/register', {
      type: userData.type,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      emailAddress: userData.emailAddress,
      roleName: userData.roleName,
      businessCode,
    });

    const response = await api.post('/user-service/api/users', { ...userData, businessCode });
    const payload = unwrapApiData<UserDto>(response.data);
    return resolvePersistedUser(payload);
  },
  
  update: async (userData: UserDto) => {
    const response = await api.put('/user-service/api/users', userData);
    const payload = unwrapApiData<UserDto>(response.data);
    return resolvePersistedUser(payload);
  },
  
  delete: async (id: number) => {
    await api.delete(`/user-service/api/users/${id}`);
  },
};
