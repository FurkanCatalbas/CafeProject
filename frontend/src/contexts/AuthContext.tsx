import React, { createContext, useContext, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logout, setCredentials } from '../store/slices/authSlice';

interface AuthContextType {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const login = (user: any, token: string) => {
    dispatch(setCredentials({ user, token }));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth sadece AuthProvider içinde kullanılabilir');
  }
  return context;
};
