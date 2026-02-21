import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  Shield,
  AlertTriangle,
  Users,
  FileCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Filter,
  Star,
  Award,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';

const SafetyDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    complianceStats: {
      totalDrivers: 0,
      compliantDrivers: 0,
      nonCompliantDrivers: 0,
      expiringSoon: 0,
      complianceRate: 0
    },
    driverCompliance: [],
    safetyScores: [],
    licenseExpirations: [],
    safetyAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    if (user && token) {
      fetchSafetyData();
    }
  }, [timeFilter, user, token]);

  const fetchSafetyData = async () => {
    try {
      setLoading(true);
      const [complianceResponse, performanceResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/analytics/compliance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/analytics/driver-performance?filter=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const complianceData = complianceResponse.data.data;
      const performanceData = performanceResponse.data.data;

      // Process safety scores from performance data
      const safetyScores = performanceData
        .filter(driver => driver.performance.safetyScore !== undefined)
        .map(driver => ({
          id: driver.driver.id,
          name: driver.driver.name,
          licenseNumber: driver.driver.licenseNumber,
          safetyScore: driver.performance.safetyScore,
          violations: driver.performance.violations || 0,
          accidents: driver.performance.accidents || 0,
          status: driver.driver.status,
          trend: Math.random() > 0.5 ? 'up' : 'down' // Mock trend data
        }))
        .sort((a, b) => b.safetyScore - a.safetyScore);

      // Process license expirations
      const licenseExpirations = complianceData.drivers.details
        .filter(driver => driver.compliance.license.isExpiringSoon || !driver.compliance.license.isValid)
        .map(driver => ({
          id: driver.id,
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          expiryDate: driver.compliance.license.expiryDate,
          isValid: driver.compliance.license.isValid,
          isExpiringSoon: driver.compliance.license.isExpiringSoon,
          status: driver.status
        }));

      // Process safety alerts
      const safetyAlerts = [
        ...performanceData
          .filter(driver => driver.performance.violations > 0 || driver.performance.accidents > 0)
          .map(driver => ({
            id: driver.driver.id,
            driverName: driver.driver.name,
            type: driver.performance.accidents > 0 ? 'Accident' : 'Violation',
            count: driver.performance.accidents + driver.performance.violations,
            severity: driver.performance.accidents > 0 ? 'high' : 'medium',
            date: new Date().toISOString()
          })),
        ...complianceData.drivers.details
          .filter(driver => !driver.compliance.license.isValid || !driver.compliance.medical.isValid)
          .map(driver => ({
            id: driver.id,
            driverName: driver.name,
            type: 'Compliance',
            count: 1,
            severity: 'high',
            date: new Date().toISOString()
          }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setDashboardData({
        complianceStats: complianceData.drivers,
        driverCompliance: complianceData.drivers.details,
        safetyScores,
        licenseExpirations,
        safetyAlerts
      });
    } catch (error) {
      console.error('Error fetching safety data:', error);
      if (error.response?.status !== 401) {
        const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'safety dashboard' }, error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Compliance Rate',
      value: `${Math.round(dashboardData.complianceStats.complianceRate)}%`,
      icon: Shield,
      color: 'bg-green-500',
      subtitle: `${dashboardData.complianceStats.compliantDrivers}/${dashboardData.complianceStats.totalDrivers} drivers`,
      change: dashboardData.complianceStats.complianceRate >= 80 ? '+2.5%' : '-1.2%',
      changeType: dashboardData.complianceStats.complianceRate >= 80 ? 'positive' : 'negative'
    },
    {
      title: 'License Expirations',
      value: dashboardData.licenseExpirations.length,
      icon: Calendar,
      color: 'bg-orange-500',
      subtitle: `${dashboardData.complianceStats.expiringSoon} expiring soon`,
      change: dashboardData.complianceStats.expiringSoon > 0 ? '+1' : '0',
      changeType: dashboardData.complianceStats.expiringSoon > 0 ? 'negative' : 'positive'
    },
    {
      title: 'Safety Alerts',
      value: dashboardData.safetyAlerts.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      subtitle: 'Requires attention',
      change: dashboardData.safetyAlerts.length > 0 ? '+3' : '0',
      changeType: dashboardData.safetyAlerts.length > 0 ? 'negative' : 'positive'
    },
    {
      title: 'Avg Safety Score',
      value: dashboardData.safetyScores.length > 0 
        ? (dashboardData.safetyScores.reduce((sum, d) => sum + d.safetyScore, 0) / dashboardData.safetyScores.length).toFixed(1)
        : '0.0',
      icon: Award,
      color: 'bg-blue-500',
      subtitle: 'Out of 10',
      change: '+0.3',
      changeType: 'positive'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (type) => {
    return type === 'positive' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
          <h1 className="text-3xl font-bold text-gray-900">Safety Command Center</h1>
          <p className="text-gray-600 mt-1">Monitor driver compliance, license expirations, and safety scores.</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UserCheck className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Review Compliance</span>
          </button>
          <button 
            onClick={() => navigate('/trips')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileCheck className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Schedule Training</span>
          </button>
          <button 
            onClick={() => navigate('/maintenance')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <AlertCircle className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Safety Audit</span>
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Eye className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Reports</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Expirations */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">License Expirations</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardData.licenseExpirations.length} Need Attention
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.licenseExpirations.slice(0, 5).map((license) => (
              <div key={license.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    !license.isValid ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {!license.isValid ? <XCircle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{license.name}</p>
                    <p className="text-xs text-gray-500">{license.licenseNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {!license.isValid ? 'Expired' : 'Expiring Soon'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(license.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Safety Alerts</h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {dashboardData.safetyAlerts.length} Active
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.safetyAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.driverName}</p>
                    <p className="text-xs text-gray-600">{alert.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{alert.count} {alert.type === 'Accident' ? 'accident(s)' : alert.type === 'Violation' ? 'violation(s)' : 'issue(s)'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Scores Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Driver Safety Scores</h2>
          <button 
            onClick={() => navigate('/analytics')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {dashboardData.safetyScores.slice(0, 8).map((driver, index) => (
            <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                  <p className="text-xs text-gray-500">{driver.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSafetyScoreColor(driver.safetyScore)}`}>
                    <Star className="h-3 w-3 mr-1" />
                    {driver.safetyScore}/10
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {driver.violations} violations, {driver.accidents} accidents
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;
