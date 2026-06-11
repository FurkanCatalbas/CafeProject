import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Sayfalar
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import PlacesPage from './pages/places/PlacesPage';
import ProductsPage from './pages/products/ProductsPage';
import OrdersPage from './pages/orders/OrdersPage';
import MusicPage from './pages/music/MusicPage';
import QrMenuPage from './pages/public/QrMenuPage';
import QrOrderPage from './pages/public/QrOrderPage';
import WelcomePage from './pages/public/WelcomePage';
import PublicMenuPage from './pages/public/PublicMenuPage';
import PublicMusicVotePage from './pages/public/PublicMusicVotePage';
import { useAuth } from './contexts/AuthContext';

const canViewDashboard = ['ADMIN', 'MANAGER'];
const canManage = ['MANAGER'];
const canOperate = ['MANAGER', 'WAITER', 'CASHIER'];
const canViewProducts = ['MANAGER', 'WAITER', 'CASHIER', 'CUSTOMER'];

const DefaultRedirect = () => {
  const { user } = useAuth();
  const role = user?.roleName || user?.role;
  return <Navigate to={canViewDashboard.includes(role) ? '/dashboard' : '/orders'} replace />;
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/qr-menu/:placeId" element={<QrMenuPage />} />
              <Route path="/qr-order/:placeId" element={<QrOrderPage />} />
              <Route path="/welcome/:qrCode" element={<WelcomePage />} />
              <Route path="/menu" element={<PublicMenuPage />} />
              <Route path="/music-vote/:qrCode" element={<PublicMusicVotePage />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route index element={<DefaultRedirect />} />
                      <Route path="dashboard" element={<ProtectedRoute allowedRoles={canViewDashboard}><DashboardPage /></ProtectedRoute>} />
                      <Route path="users" element={<ProtectedRoute allowedRoles={canManage}><UsersPage /></ProtectedRoute>} />
                      <Route path="tables" element={<ProtectedRoute allowedRoles={canOperate}><PlacesPage /></ProtectedRoute>} />
                      <Route path="places" element={<Navigate to="/tables" replace />} />
                      <Route path="products" element={<ProtectedRoute allowedRoles={canViewProducts}><ProductsPage /></ProtectedRoute>} />
                      <Route path="orders" element={<ProtectedRoute allowedRoles={canViewProducts}><OrdersPage /></ProtectedRoute>} />
                      <Route path="music" element={<ProtectedRoute allowedRoles={canOperate}><MusicPage /></ProtectedRoute>} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
