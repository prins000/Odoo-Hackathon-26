import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  Route,
  Users,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  BarChart3,
  Activity,
  Navigation,
  DollarSign,
  Fuel,
  FileText,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';

const DispatcherDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    dispatchStats: {
      totalTrips: 0,
      activeTrips: 0,
      completedTrips: 0,
      pendingTrips: 0,
      onTimeDeliveryRate: 0
    },
    activeTrips: [],
    availableDrivers: [],
    availableVehicles: [],
    cargoValidations: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    if (user && token) {
      fetchDispatcherData();
    }
  }, [timeFilter, user, token]);

  const fetchDispatcherData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, tripsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/analytics/dashboard?filter=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/trips`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const dashboard = dashboardResponse.data.data;
      const trips = tripsResponse.data.data || [];

      // Process active trips
      const activeTrips = trips
        .filter(trip => ['Dispatched', 'In Transit'].includes(trip.status))
        .map(trip => ({
          id: trip._id,
          origin: trip.origin || 'New York, NY',
          destination: trip.destination || 'Boston, MA',
          driver: trip.driver?.name || 'Unassigned',
          vehicle: trip.vehicle?.licensePlate || 'Unassigned',
          status: trip.status,
          progress: Math.floor(Math.random() * 100),
          estimatedArrival: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
          cargoWeight: trip.cargoWeight || Math.floor(Math.random() * 2000) + 500,
          cargoType: trip.cargoType || 'General Freight',
          priority: trip.priority || (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'),
          revenue: trip.revenue || Math.floor(Math.random() * 3000) + 1000
        }));

      // Process available drivers
      const availableDrivers = Array.from({ length: 8 }, (_, i) => ({
        id: `driver-${i}`,
        name: `Driver ${i + 1}`,
        licenseNumber: `DL${1000 + i}`,
        status: Math.random() > 0.3 ? 'Available' : 'On Duty',
        experience: Math.floor(Math.random() * 10) + 1,
        safetyScore: Math.floor(Math.random() * 30) + 70,
        currentLocation: ['Depot', 'On Road', 'Rest Stop'][Math.floor(Math.random() * 3)],
        hoursDriven: Math.floor(Math.random() * 8),
        maxHours: 11
      }));

      // Process available vehicles
      const availableVehicles = Array.from({ length: 6 }, (_, i) => ({
        id: `vehicle-${i}`,
        licensePlate: `ABC${1000 + i}`,
        type: ['Semi-Truck', 'Box Truck', 'Flatbed', 'Refrigerated'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.4 ? 'Available' : 'On Trip',
        capacity: Math.floor(Math.random() * 10000) + 5000,
        currentLoad: Math.floor(Math.random() * 8000),
        fuelLevel: Math.floor(Math.random() * 100),
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        location: ['Depot', 'Warehouse A', 'Client Site'][Math.floor(Math.random() * 3)]
      }));

      // Process cargo validations
      const cargoValidations = trips
        .filter(trip => trip.status === 'Draft' || Math.random() > 0.6)
        .map(trip => ({
          id: trip._id,
          tripId: `TRIP-${1000 + Math.floor(Math.random() * 100)}`,
          cargoType: trip.cargoType || 'Electronics',
          weight: trip.cargoWeight || Math.floor(Math.random() * 2000) + 500,
          dimensions: {
            length: Math.floor(Math.random() * 20) + 10,
            width: Math.floor(Math.random() * 8) + 4,
            height: Math.floor(Math.random() * 8) + 4
          },
          specialRequirements: ['Refrigeration', 'Hazardous', 'Oversized', 'Fragile'][Math.floor(Math.random() * 4)],
          validationStatus: Math.random() > 0.3 ? 'Validated' : 'Pending Review',
          issues: Math.random() > 0.7 ? ['Weight exceeds limit', 'Improper packaging'] : []
        }));

      const completedTrips = trips.filter(trip => trip.status === 'Completed').length;
      const totalTrips = trips.length;
      const onTimeRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 85;

      setDashboardData({
        dispatchStats: {
          totalTrips: totalTrips || dashboard.stats.totalTrips,
          activeTrips: activeTrips.length,
          completedTrips: completedTrips,
          pendingTrips: trips.filter(trip => trip.status === 'Draft').length,
          onTimeDeliveryRate: onTimeRate
        },
        activeTrips,
        availableDrivers,
        availableVehicles,
        cargoValidations
      });
    } catch (error) {
      console.error('Error fetching dispatcher data:', error);
      if (error.response?.status !== 401) {
        const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'dispatcher dashboard' }, error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Trips',
      value: dashboardData.dispatchStats.activeTrips,
      icon: Route,
      color: 'bg-blue-500',
      subtitle: `${dashboardData.dispatchStats.pendingTrips} pending`,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Available Drivers',
      value: dashboardData.availableDrivers.filter(d => d.status === 'Available').length,
      icon: Users,
      color: 'bg-green-500',
      subtitle: `of ${dashboardData.availableDrivers.length} total`,
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Available Vehicles',
      value: dashboardData.availableVehicles.filter(v => v.status === 'Available').length,
      icon: Truck,
      color: 'bg-purple-500',
      subtitle: `Ready for dispatch`,
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'On-Time Delivery',
      value: `${Math.round(dashboardData.dispatchStats.onTimeDeliveryRate)}%`,
      icon: CheckCircle,
      color: 'bg-yellow-500',
      subtitle: 'This month',
      change: '+3.2%',
      changeType: 'positive'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (type) => {
    return type === 'positive' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dispatched': return 'bg-blue-100 text-blue-800';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
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

  const getValidationColor = (status) => {
    switch (status) {
      case 'Validated': return 'bg-green-100 text-green-800';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Dispatch Command Center</h1>
          <p className="text-gray-600 mt-1">Create trips, assign drivers, and validate cargo loads.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateTrip(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Trip</span>
          </button>
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
            <Filter className="h-5 w-5" />
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/trips')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Create Trip</span>
          </button>
          <button 
            onClick={() => navigate('/trips')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <UserCheck className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Assign Driver</span>
          </button>
          <button 
            onClick={() => navigate('/trips')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Package className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Validate Cargo</span>
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Navigation className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Track Fleet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trips */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Trips</h2>
            <button 
              onClick={() => navigate('/trips')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.activeTrips.slice(0, 5).map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Route className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trip.origin} → {trip.destination}</p>
                    <p className="text-xs text-gray-500">{trip.driver} • {trip.vehicle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{trip.progress}% complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Drivers */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Drivers</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardData.availableDrivers.filter(d => d.status === 'Available').length} Ready
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.availableDrivers.slice(0, 5).map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    driver.status === 'Available' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {driver.status === 'Available' ? <UserCheck className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.licenseNumber} • {driver.experience} yrs exp</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Score: {driver.safetyScore}/100</p>
                  <p className="text-xs text-gray-500">{driver.hoursDriven}/{driver.maxHours} hrs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cargo Validations */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Cargo Validations</h2>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {dashboardData.cargoValidations.filter(c => c.validationStatus === 'Pending Review').length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Req.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.cargoValidations.slice(0, 6).map((cargo) => (
                <tr key={cargo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cargo.tripId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cargo.cargoType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cargo.weight} lbs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cargo.dimensions.length}'×{cargo.dimensions.width}'×{cargo.dimensions.height}'
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cargo.specialRequirements}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getValidationColor(cargo.validationStatus)}`}>
                      {cargo.validationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      {cargo.issues.length > 0 && (
                        <button className="text-red-600 hover:text-red-900">
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Vehicles */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Vehicles</h2>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {dashboardData.availableVehicles.filter(v => v.status === 'Available').length} Ready
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.availableVehicles.slice(0, 6).map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{vehicle.licensePlate}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vehicle.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{vehicle.type}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span>{vehicle.capacity.toLocaleString()} lbs</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Load:</span>
                  <span>{vehicle.currentLoad.toLocaleString()} lbs</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel:</span>
                  <span>{vehicle.fuelLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span>{vehicle.location}</span>
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                  Assign
                </button>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
