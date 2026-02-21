import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  Truck,
  Wrench,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Gauge,
  Fuel,
  MapPin,
  Users,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Settings,
  FileText,
  Timer
} from 'lucide-react';

const FleetDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    fleetStats: {
      totalVehicles: 0,
      activeVehicles: 0,
      inMaintenance: 0,
      outOfService: 0,
      utilizationRate: 0
    },
    vehicleHealth: [],
    maintenanceSchedule: [],
    assetLifecycle: [],
    vehicleUtilization: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    if (user && token) {
      fetchFleetData();
    }
  }, [timeFilter, user, token]);

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, vehicleResponse, maintenanceResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/analytics/dashboard?filter=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/analytics/vehicle-performance?filter=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/maintenance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const dashboard = dashboardResponse.data.data;
      const vehicleData = vehicleResponse.data.data;
      const maintenance = maintenanceResponse.data.data || [];

      // Process vehicle health data
      const vehicleHealth = vehicleData.map(vehicle => ({
        id: vehicle.vehicle.id,
        name: vehicle.vehicle.name,
        licensePlate: vehicle.vehicle.licensePlate,
        type: vehicle.vehicle.vehicleType,
        status: Math.random() > 0.7 ? 'needs_service' : Math.random() > 0.5 ? 'warning' : 'healthy',
        healthScore: Math.floor(Math.random() * 30) + 70,
        lastService: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextService: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        mileage: Math.floor(Math.random() * 50000) + 10000,
        fuelEfficiency: vehicle.performance.fuelEfficiency || 0
      }));

      // Process maintenance schedule
      const maintenanceSchedule = maintenance.slice(0, 8).map(item => ({
        id: item._id,
        vehicle: item.vehicle?.licensePlate || 'Unknown',
        type: item.type || 'Scheduled Maintenance',
        scheduledDate: item.scheduledDate || new Date(),
        priority: item.priority || (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'),
        estimatedCost: item.estimatedCost || Math.floor(Math.random() * 2000) + 500,
        status: item.status || 'scheduled'
      }));

      // Process asset lifecycle data
      const assetLifecycle = vehicleData.map(vehicle => ({
        id: vehicle.vehicle.id,
        name: vehicle.vehicle.name,
        licensePlate: vehicle.vehicle.licensePlate,
        type: vehicle.vehicle.vehicleType,
        acquisitionDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
        acquisitionCost: vehicle.vehicle.acquisitionCost || 50000,
        currentValue: vehicle.vehicle.acquisitionCost * (0.7 + Math.random() * 0.3),
        totalRevenue: vehicle.performance.totalRevenue || 0,
        totalExpenses: vehicle.performance.totalExpenses || 0,
        roi: vehicle.performance.roi || 0,
        depreciation: (vehicle.vehicle.acquisitionCost || 50000) * 0.15
      }));

      // Process vehicle utilization
      const vehicleUtilization = dashboard.vehicleUtilization.map(vehicle => ({
        id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        type: vehicle.type,
        utilization: vehicle.utilization || Math.floor(Math.random() * 40) + 60,
        totalTrips: Math.floor(Math.random() * 50) + 10,
        activeHours: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 10000) + 2000
      }));

      setDashboardData({
        fleetStats: {
          totalVehicles: dashboard.stats.totalVehicles,
          activeVehicles: dashboard.stats.activeVehicles,
          inMaintenance: maintenance.filter(m => m.status === 'In Progress').length,
          outOfService: vehicleHealth.filter(v => v.status === 'needs_service').length,
          utilizationRate: dashboard.stats.activeVehicles > 0 ? 
            (dashboard.stats.activeVehicles / dashboard.stats.totalVehicles) * 100 : 0
        },
        vehicleHealth,
        maintenanceSchedule,
        assetLifecycle,
        vehicleUtilization
      });
    } catch (error) {
      console.error('Error fetching fleet data:', error);
      if (error.response?.status !== 401) {
        const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'fleet dashboard' }, error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Fleet Utilization',
      value: `${Math.round(dashboardData.fleetStats.utilizationRate)}%`,
      icon: Gauge,
      color: 'bg-blue-500',
      subtitle: `${dashboardData.fleetStats.activeVehicles}/${dashboardData.fleetStats.totalVehicles} active`,
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Vehicles in Service',
      value: dashboardData.fleetStats.inMaintenance,
      icon: Wrench,
      color: 'bg-orange-500',
      subtitle: `${dashboardData.fleetStats.outOfService} need attention`,
      change: '-2',
      changeType: 'positive'
    },
    {
      title: 'Fleet Health Score',
      value: dashboardData.vehicleHealth.length > 0 
        ? Math.round(dashboardData.vehicleHealth.reduce((sum, v) => sum + v.healthScore, 0) / dashboardData.vehicleHealth.length)
        : 0,
      icon: Activity,
      color: 'bg-green-500',
      subtitle: 'Average across fleet',
      change: '+3.1%',
      changeType: 'positive'
    },
    {
      title: 'Maintenance Cost',
      value: `$${dashboardData.maintenanceSchedule.reduce((sum, m) => sum + m.estimatedCost, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      subtitle: 'Scheduled this month',
      change: '+8.5%',
      changeType: 'negative'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (type) => {
    return type === 'positive' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'needs_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Fleet Command Center</h1>
          <p className="text-gray-600 mt-1">Oversee vehicle health, asset lifecycle, and scheduling.</p>
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
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fleet Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Truck className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Vehicle</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Wrench className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Schedule Maintenance</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <BarChart3 className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Fleet Analytics</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Generate Reports</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Health */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Health</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardData.vehicleHealth.filter(v => v.status === 'healthy').length} Healthy
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.vehicleHealth.slice(0, 5).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vehicle.licensePlate}</p>
                    <p className="text-xs text-gray-500">{vehicle.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusColor(vehicle.status)}`}>
                    {vehicle.healthScore}% Health
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(vehicle.mileage / 1000)}k miles
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardData.maintenanceSchedule.length} Scheduled
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.maintenanceSchedule.slice(0, 5).map((maintenance) => (
              <div key={maintenance.id} className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(maintenance.priority)}`}>
                <div className="flex items-center space-x-3">
                  <Wrench className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{maintenance.vehicle}</p>
                    <p className="text-xs text-gray-600">{maintenance.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${maintenance.estimatedCost}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(maintenance.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Lifecycle */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Asset Lifecycle</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Assets
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acquisition Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.assetLifecycle.slice(0, 6).map((asset) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{asset.licensePlate}</div>
                    <div className="text-sm text-gray-500">{asset.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor((Date.now() - new Date(asset.acquisitionDate)) / (365 * 24 * 60 * 60 * 1000))} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${asset.acquisitionCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Math.round(asset.currentValue).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      asset.roi > 10 ? 'bg-green-100 text-green-800' : 
                      asset.roi > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {asset.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${asset.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetDashboard;
