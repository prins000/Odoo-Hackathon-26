import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from './store';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import CommandCenter from './pages/dashboard/CommandCenter';
import SafetyDashboard from './pages/dashboard/SafetyDashboard';
import FleetDashboard from './pages/dashboard/FleetDashboard';
import DispatcherDashboard from './pages/dashboard/DispatcherDashboard';
import FinancialDashboard from './pages/dashboard/FinancialDashboard';
import VehicleRegistry from './pages/vehicles/VehicleRegistry';
import TripDispatcher from './pages/trips/TripDispatcher';
import MaintenanceManagement from './pages/maintenance/MaintenanceManagement';
import ExpenseManagement from './pages/expenses/ExpenseManagement';
import FuelManagement from './pages/fuel/FuelManagement';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import Profile from './pages/auth/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'Safety Officer') {
    return <SafetyDashboard />;
  }
  
  if (user?.role === 'Fleet Manager') {
    return <FleetDashboard />;
  }
  
  if (user?.role === 'Dispatcher') {
    return <DispatcherDashboard />;
  }
  
  if (user?.role === 'Financial Analyst') {
    return <FinancialDashboard />;
  }
  
  return <CommandCenter />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <DashboardRouter />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vehicles" element={
        <ProtectedRoute>
          <Layout>
            <VehicleRegistry />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/trips" element={
        <ProtectedRoute>
          <Layout>
            <TripDispatcher />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <Layout>
            <MaintenanceManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute>
          <Layout>
            <ExpenseManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/fuel" element={
        <ProtectedRoute>
          <Layout>
            <FuelManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <AnalyticsDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
