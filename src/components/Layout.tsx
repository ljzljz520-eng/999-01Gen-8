import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore, getUserRole } from '../store/authStore.js';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ScanLine, 
  Users, 
  BarChart3, 
  LogOut,
  User,
  GraduationCap,
  Package
} from 'lucide-react';
import type { UserRole } from '../../shared/types.js';

const roleNavItems: Record<UserRole, { to: string; label: string; icon: React.ReactNode }[]> = {
  parent: [
    { to: '/parent', label: '首页', icon: <LayoutDashboard size={20} /> },
    { to: '/parent/orders', label: '我的订单', icon: <ShoppingCart size={20} /> },
  ],
  distributor: [
    { to: '/scan', label: '扫码核销', icon: <ScanLine size={20} /> },
    { to: '/exception', label: '异常处理', icon: <Package size={20} /> },
  ],
  teacher: [
    { to: '/teacher', label: '班级概览', icon: <GraduationCap size={20} /> },
    { to: '/teacher/uncollected', label: '未领取名单', icon: <Users size={20} /> },
  ],
  finance: [
    { to: '/finance', label: '财务概览', icon: <BarChart3 size={20} /> },
    { to: '/finance/reports', label: '统计报表', icon: <BarChart3 size={20} /> },
  ],
  admin: [
    { to: '/admin', label: '管理后台', icon: <LayoutDashboard size={20} /> },
    { to: '/scan', label: '扫码核销', icon: <ScanLine size={20} /> },
  ],
};

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const role = getUserRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || !role || !user) {
    return <Outlet />;
  }

  const navItems = roleNavItems[role] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">校服订单核销平台</h1>
                <p className="text-xs text-slate-500">School Uniform Order System</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                >
                  <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-blue-600">
                    {role === 'parent' ? '家长' : 
                     role === 'distributor' ? '发放员' :
                     role === 'teacher' ? '班主任' :
                     role === 'finance' ? '财务' : '管理员'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm font-medium">退出</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-blue-100 bg-white">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex flex-col items-center space-y-1 px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
