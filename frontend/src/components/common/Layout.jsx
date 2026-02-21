import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Truck, 
  Route, 
  Users, 
  Menu, 
  X, 
  LogOut,
  User,
  Settings,
  Wrench,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: user?.role === 'Safety Officer' ? 'Safety Dashboard' : 
            user?.role === 'Fleet Manager' ? 'Fleet Dashboard' : 
            user?.role === 'Dispatcher' ? 'Dispatch Dashboard' : 
            user?.role === 'Financial Analyst' ? 'Financial Dashboard' : 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']
    },
    {
      name: 'Vehicles',
      path: '/vehicles',
      icon: Truck,
      roles: ['Fleet Manager'],
      description: 'Oversee vehicle health and asset lifecycle'
    },
    {
      name: 'Trip Management',
      path: '/trips',
      icon: Route,
      roles: ['Dispatcher'],
      description: 'Create trips, assign drivers, and validate cargo loads'
    },
    {
      name: 'Maintenance',
      path: '/maintenance',
      icon: Wrench,
      roles: ['Fleet Manager'],
      description: 'Manage vehicle maintenance and scheduling'
    },
    {
      name: 'Expenses',
      path: '/expenses',
      icon: DollarSign,
      roles: ['Financial Analyst'],
      description: 'Audit fuel spend, maintenance ROI, and operational costs'
    },
    {
      name: 'Fuel Management',
      path: '/fuel',
      icon: DollarSign,
      roles: ['Financial Analyst'],
      description: 'Monitor fuel consumption and costs'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: LayoutDashboard,
      roles: ['Safety Officer', 'Financial Analyst'],
      description: 'Monitor compliance, safety scores, and financial metrics'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">FleetFlow</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <Link
              to="/profile"
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 w-full
                ${isActive('/profile')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-500 hover:text-gray-700"
                  title="Profile"
                >
                  <User className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
