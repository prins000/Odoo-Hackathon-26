import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  Truck,
  Users,
  Route,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const CommandCenter = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalVehicles: 0,
      activeVehicles: 0,
      totalDrivers: 0,
      activeDrivers: 0,
      totalTrips: 0,
      activeTrips: 0,
      totalRevenue: 0,
      totalExpenses: 0
    },
    recentTrips: [],
    maintenanceAlerts: [],
    driverPerformance: [],
    vehicleUtilization: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [timeFilter, user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/analytics/dashboard?filter=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show toast for 401 errors as they're expected during auth flow
      if (error.response?.status !== 401) {
        const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'dashboard' }, error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Fleet',
      value: `${dashboardData.stats.activeVehicles}/${dashboardData.stats.totalVehicles}`,
      icon: Truck,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Drivers',
      value: `${dashboardData.stats.activeDrivers}/${dashboardData.stats.totalDrivers}`,
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Active Trips',
      value: dashboardData.stats.activeTrips,
      icon: Route,
      color: 'bg-purple-500',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Net Revenue',
      value: `$${(dashboardData.stats.totalRevenue - dashboardData.stats.totalExpenses).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+8%',
      changeType: 'positive'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (type) => {
    return type === 'positive' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (loading || !user || !token) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your fleet overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Calendar className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className={`flex items-center mt-2 text-sm ${getChangeColor(stat.changeType)}`}>
                    {getChangeIcon(stat.changeType)}
                    <span className="ml-1">{stat.change}</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Truck className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Vehicle</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Route className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Create Trip</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Driver</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <BarChart3 className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Reports</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.recentTrips.slice(0, 5).map((trip) => (
              <div key={trip._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    trip.status === 'completed' ? 'bg-green-100' :
                    trip.status === 'in-progress' ? 'bg-blue-100' :
                    trip.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {trip.status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                     trip.status === 'in-progress' ? <Activity className="h-4 w-4 text-blue-600" /> :
                     trip.status === 'cancelled' ? <XCircle className="h-4 w-4 text-red-600" /> :
                     <Clock className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trip.origin} → {trip.destination}</p>
                    <p className="text-xs text-gray-500">{trip.vehicle?.licensePlate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${trip.revenue}</p>
                  <p className="text-xs text-gray-500 capitalize">{trip.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Alerts</h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardData.maintenanceAlerts.length} Urgent
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.maintenanceAlerts.slice(0, 5).map((alert) => (
              <div key={alert._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.vehicle?.licensePlate}</p>
                    <p className="text-xs text-gray-500">{alert.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">Overdue</p>
                  <p className="text-xs text-gray-500">{alert.daysOverdue} days</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drivers */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Drivers</h2>
          <div className="space-y-3">
            {dashboardData.driverPerformance.slice(0, 5).map((driver, index) => (
              <div key={driver._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.completedTrips} trips</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{driver.rating}/5.0</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-1 rounded-full mx-0.5 ${
                          i < Math.floor(driver.rating) ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Utilization */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Utilization</h2>
          <div className="space-y-3">
            {dashboardData.vehicleUtilization.slice(0, 5).map((vehicle) => (
              <div key={vehicle._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vehicle.licensePlate}</p>
                    <p className="text-xs text-gray-500">{vehicle.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${vehicle.utilization}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {vehicle.utilization}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
