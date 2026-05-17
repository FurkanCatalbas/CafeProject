import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const getRoleLabelTr = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'Yönetici';
    case 'MANAGER': return 'Müdür';
    case 'WAITER': return 'Garson';
    case 'CASHIER': return 'Kasiyer';
    case 'CUSTOMER': return 'Müşteri';
    default: return role ?? '';
  }
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden text-gray-400 hover:text-gray-600"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {getRoleLabelTr(user?.roleName)}
          </p>
        </div>
        
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 hover:bg-gray-50 transition-colors">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white">
            <User className="w-5 h-5" />
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
