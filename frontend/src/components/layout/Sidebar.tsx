import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Coffee,
  LayoutDashboard, 
  Users, 
  MapPin, 
  Package, 
  ShoppingCart, 
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Panolar' },
    { path: '/users', icon: Users, label: 'Çalışanlar' },
    { path: '/tables', icon: MapPin, label: 'Masa Yönetimi' },
    { path: '/products', icon: Package, label: 'Ürünler' },
    { path: '/orders', icon: ShoppingCart, label: 'Siparişler' },
  ];

  return (
    <>
      {/* Mobil arka plan */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Yan menü */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-r border-blue-900/60
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-full flex-col">
        <div className="flex items-center justify-between h-16 px-5 border-b border-blue-900/60">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Coffee className="h-4 w-4" />
            </span>
            <h1 className="text-sm font-semibold text-white tracking-wide">KAFE YÖNETİMİ</h1>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-3.5">
          <p className="mb-2 px-2.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">MENÜ</p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`
                      flex items-center px-2.5 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto border-t border-blue-900/60 p-3.5">
          <div className="rounded-xl bg-white/10 p-2.5">
            <p className="text-sm font-medium text-white">Çevrimiçi</p>
            <p className="text-xs text-slate-300">Bağlantınız aktif</p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
