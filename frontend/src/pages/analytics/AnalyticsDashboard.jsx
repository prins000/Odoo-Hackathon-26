import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  Users,
  Route,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Wrench,
  FileText,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  MapPin,
  Gauge,
  Zap,
  Target,
  Award
} from 'lucide-react';

// Import Recharts components
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area as ComposedArea
} from 'recharts';

const AnalyticsDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Check if user has access to analytics
  const hasAnalyticsAccess = ['admin', 'manager', 'dispatcher'].includes(user?.role);
  const hasFullAnalyticsAccess = ['admin', 'manager'].includes(user?.role);

  // Analytics data
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalTrips: 0,
    activeVehicles: 0,
    activeDrivers: 0,
    fuelEfficiency: 0,
    onTimeDelivery: 0,
    totalExpenses: 0,
    maintenanceCosts: 0,
    avgTripDuration: 0,
    customerSatisfaction: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [tripData, setTripData] = useState([]);
  const [vehiclePerformance, setVehiclePerformance] = useState([]);
  const [driverPerformance, setDriverPerformance] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fleetUtilization, setFleetUtilization] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  useEffect(() => {
    if (hasAnalyticsAccess) {
      fetchAnalyticsData();
    }
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data with realistic values for demonstration
      const mockData = {
        dashboardStats: {
          totalRevenue: 458290,
          totalTrips: 1247,
          activeVehicles: 28,
          activeDrivers: 32,
          fuelEfficiency: 8.2,
          onTimeDelivery: 94.5,
          totalExpenses: 125340,
          maintenanceCosts: 28450,
          avgTripDuration: 4.5,
          customerSatisfaction: 4.7
        },
        revenueData: [
          { month: 'Jan', revenue: 32000, expenses: 12000, profit: 20000 },
          { month: 'Feb', revenue: 38000, expenses: 13500, profit: 24500 },
          { month: 'Mar', revenue: 42000, expenses: 14000, profit: 28000 },
          { month: 'Apr', revenue: 45000, expenses: 15000, profit: 30000 },
          { month: 'May', revenue: 48000, expenses: 16000, profit: 32000 },
          { month: 'Jun', revenue: 52000, expenses: 17000, profit: 35000 }
        ],
        tripData: [
          { day: 'Mon', trips: 45, completed: 42, cancelled: 3 },
          { day: 'Tue', trips: 52, completed: 48, cancelled: 4 },
          { day: 'Wed', trips: 48, completed: 46, cancelled: 2 },
          { day: 'Thu', trips: 58, completed: 55, cancelled: 3 },
          { day: 'Fri', trips: 62, completed: 58, cancelled: 4 },
          { day: 'Sat', trips: 35, completed: 34, cancelled: 1 },
          { day: 'Sun', trips: 28, completed: 27, cancelled: 1 }
        ],
        vehiclePerformance: [
          { id: 1, name: 'Truck-001', efficiency: 92, trips: 45, revenue: 12500, utilization: 85 },
          { id: 2, name: 'Truck-002', efficiency: 88, trips: 42, revenue: 11800, utilization: 78 },
          { id: 3, name: 'Truck-003', efficiency: 95, trips: 48, revenue: 13200, utilization: 92 },
          { id: 4, name: 'Truck-004', efficiency: 85, trips: 38, revenue: 10500, utilization: 70 }
        ],
        driverPerformance: [
          { id: 1, name: 'John Smith', trips: 62, rating: 4.8, onTime: 96, efficiency: 94 },
          { id: 2, name: 'Sarah Johnson', trips: 58, rating: 4.9, onTime: 98, efficiency: 96 },
          { id: 3, name: 'Mike Wilson', trips: 55, rating: 4.7, onTime: 94, efficiency: 91 },
          { id: 4, name: 'Emily Davis', trips: 52, rating: 4.9, onTime: 97, efficiency: 93 }
        ],
        expenseBreakdown: [
          { category: 'Fuel', amount: 45000, percentage: 35 },
          { category: 'Maintenance', amount: 28450, percentage: 22 },
          { category: 'Salaries', amount: 32000, percentage: 25 },
          { category: 'Insurance', amount: 12000, percentage: 9 },
          { category: 'Other', amount: 10890, percentage: 9 }
        ],
        topRoutes: [
          { route: 'Mumbai-Delhi', trips: 124, revenue: 45000, distance: 1420 },
          { route: 'Bangalore-Chennai', trips: 98, revenue: 38000, distance: 350 },
          { route: 'Kolkata-Hyderabad', trips: 87, revenue: 32000, distance: 1500 },
          { route: 'Delhi-Jaipur', trips: 76, revenue: 28000, distance: 280 }
        ],
        alerts: [
          { type: 'warning', message: 'Truck-002 maintenance overdue', priority: 'high' },
          { type: 'info', message: 'Fuel prices increased by 5%', priority: 'medium' },
          { type: 'success', message: 'All trips completed on time this week', priority: 'low' }
        ],
        fleetUtilization: [
          { time: '00:00', utilization: 45 },
          { time: '04:00', utilization: 52 },
          { time: '08:00', utilization: 78 },
          { time: '12:00', utilization: 92 },
          { time: '16:00', utilization: 88 },
          { time: '20:00', utilization: 65 },
          { time: '23:59', utilization: 48 }
        ],
        performanceMetrics: [
          { metric: 'Efficiency', value: 85 },
          { metric: 'Punctuality', value: 94 },
          { metric: 'Safety', value: 92 },
          { metric: 'Cost Control', value: 78 },
          { metric: 'Customer Satisfaction', value: 96 }
        ]
      };

      setDashboardStats(mockData.dashboardStats);
      setRevenueData(mockData.revenueData);
      setTripData(mockData.tripData);
      setVehiclePerformance(mockData.vehiclePerformance);
      setDriverPerformance(mockData.driverPerformance);
      setExpenseBreakdown(mockData.expenseBreakdown);
      setTopRoutes(mockData.topRoutes);
      setAlerts(mockData.alerts);
      setFleetUtilization(mockData.fleetUtilization);
      setPerformanceMetrics(mockData.performanceMetrics);

    } catch (error) {
      const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'analytics' }, error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg bg-gradient-to-br from-${color}-100 to-${color}-200`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {change && (
          <div className={`flex items-center px-2 py-1 rounded-full ${
            changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {changeType === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!hasAnalyticsAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'dispatcher' ? 'View operational analytics' : 'Comprehensive fleet analytics'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border flex items-center ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'error' ? 'bg-red-50 border-red-200' :
                alert.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mr-3 ${
                alert.type === 'warning' ? 'text-yellow-600' :
                alert.type === 'error' ? 'text-red-600' :
                alert.type === 'success' ? 'text-green-600' :
                'text-blue-600'
              }`} />
              <span className="flex-1 text-sm">{alert.message}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {alert.priority}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+12.5%"
          changeType="up"
          color="green"
          subtitle="Last 30 days"
        />
        <StatCard
          title="Total Trips"
          value={dashboardStats.totalTrips}
          icon={Route}
          change="+8.2%"
          changeType="up"
          color="blue"
          subtitle="Completed"
        />
        <StatCard
          title="Active Vehicles"
          value={dashboardStats.activeVehicles}
          icon={Truck}
          change="-2.1%"
          changeType="down"
          color="purple"
          subtitle="In operation"
        />
        <StatCard
          title="Fuel Efficiency"
          value={`${dashboardStats.fuelEfficiency} mpg`}
          icon={Fuel}
          change="+3.4%"
          changeType="up"
          color="yellow"
          subtitle="Average"
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('revenue')}
              className={`px-3 py-1 rounded ${selectedMetric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Revenue
            </button>
            <button
              onClick={() => setSelectedMetric('expenses')}
              className={`px-3 py-1 rounded ${selectedMetric === 'expenses' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setSelectedMetric('profit')}
              className={`px-3 py-1 rounded ${selectedMetric === 'profit' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Profit
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {(selectedMetric === 'revenue' || selectedMetric === 'all') && (
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
            )}
            {(selectedMetric === 'expenses' || selectedMetric === 'all') && (
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" />
            )}
            {(selectedMetric === 'profit' || selectedMetric === 'all') && (
              <Area type="monotone" dataKey="profit" stroke="#3B82F6" fillOpacity={1} fill="url(#colorProfit)" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trip Analytics and Fleet Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Trip Completion Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tripData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Fleet Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fleetUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="utilization" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown and Performance Metrics */}
      {hasFullAnalyticsAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({category, percentage}) => `${category}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Performance Tables */}
      {hasFullAnalyticsAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Vehicle</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Efficiency</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Trips</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiclePerformance.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-100">
                      <td className="py-2 px-2 text-sm font-medium">{vehicle.name}</td>
                      <td className="py-2 px-2 text-sm">
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{width: `${vehicle.efficiency}%`}}
                            ></div>
                          </div>
                          <span>{vehicle.efficiency}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-sm">{vehicle.trips}</td>
                      <td className="py-2 px-2 text-sm">${vehicle.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Driver</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Trips</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Rating</th>
                    <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">On-Time</th>
                  </tr>
                </thead>
                <tbody>
                  {driverPerformance.map((driver) => (
                    <tr key={driver.id} className="border-b border-gray-100">
                      <td className="py-2 px-2 text-sm font-medium">{driver.name}</td>
                      <td className="py-2 px-2 text-sm">{driver.trips}</td>
                      <td className="py-2 px-2 text-sm">
                        <div className="flex items-center">
                          <span className="text-yellow-500">⭐</span>
                          <span className="ml-1">{driver.rating}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-sm">
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{width: `${driver.onTime}%`}}
                            ></div>
                          </div>
                          <span>{driver.onTime}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Routes */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRoutes.map((route, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">#{index + 1}</span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm">{route.route}</h4>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Trips:</span>
                  <span className="font-medium">{route.trips}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">${route.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{route.distance}km</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
