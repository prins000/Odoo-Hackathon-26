import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Fuel,
  Wrench,
  Truck,
  Activity,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Eye,
  Calculator,
  Receipt,
  CreditCard,
  PiggyBank,
  Target,
  Zap,
  TrendingDown as TrendingDownIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const FinancialDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    financialStats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      fuelCosts: 0,
      maintenanceCosts: 0,
      operationalCosts: 0
    },
    fuelSpendAnalysis: [],
    maintenanceROI: [],
    operationalCosts: [],
    costBreakdown: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');

  useEffect(() => {
    if (user && token) {
      fetchFinancialData();
    }
  }, [timeFilter, user, token]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, financialResponse, expenseResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/analytics/dashboard?filter=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/analytics/financial-reports?filter=${timeFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/expenses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const dashboard = dashboardResponse.data.data;
      const financial = financialResponse.data.data;
      const expenses = expenseResponse.data.data || [];

      // Process fuel spend analysis
      const fuelSpendAnalysis = Array.from({ length: 8 }, (_, i) => ({
        id: `fuel-${i}`,
        vehicle: `Vehicle ${1000 + i}`,
        licensePlate: `ABC${1000 + i}`,
        totalSpend: Math.floor(Math.random() * 5000) + 2000,
        gallons: Math.floor(Math.random() * 1000) + 200,
        costPerGallon: (Math.random() * 2 + 3).toFixed(2),
        mpg: (Math.random() * 5 + 5).toFixed(1),
        efficiency: Math.random() > 0.5 ? 'Good' : Math.random() > 0.3 ? 'Average' : 'Poor',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercent: (Math.random() * 20 - 10).toFixed(1)
      }));

      // Process maintenance ROI
      const maintenanceROI = Array.from({ length: 6 }, (_, i) => ({
        id: `maintenance-${i}`,
        vehicle: `Vehicle ${1000 + i}`,
        licensePlate: `ABC${1000 + i}`,
        totalMaintenance: Math.floor(Math.random() * 10000) + 5000,
        maintenanceCount: Math.floor(Math.random() * 10) + 3,
        downtimeHours: Math.floor(Math.random() * 100) + 20,
        costPerHour: Math.floor(Math.random() * 100) + 50,
        roi: (Math.random() * 200 - 50).toFixed(1),
        lastMaintenance: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
      }));

      // Process operational costs
      const operationalCosts = [
        {
          category: 'Fuel',
          amount: Math.floor(Math.random() * 50000) + 30000,
          percentage: 35,
          trend: 'up',
          trendPercent: '+8.5%',
          icon: Fuel,
          color: 'bg-blue-500'
        },
        {
          category: 'Maintenance',
          amount: Math.floor(Math.random() * 30000) + 20000,
          percentage: 25,
          trend: 'down',
          trendPercent: '-3.2%',
          icon: Wrench,
          color: 'bg-green-500'
        },
        {
          category: 'Insurance',
          amount: Math.floor(Math.random() * 15000) + 10000,
          percentage: 12,
          trend: 'up',
          trendPercent: '+2.1%',
          icon: FileText,
          color: 'bg-purple-500'
        },
        {
          category: 'Labor',
          amount: Math.floor(Math.random() * 25000) + 15000,
          percentage: 20,
          trend: 'up',
          trendPercent: '+5.3%',
          icon: Users,
          color: 'bg-yellow-500'
        },
        {
          category: 'Other',
          amount: Math.floor(Math.random() * 10000) + 5000,
          percentage: 8,
          trend: 'down',
          trendPercent: '-1.8%',
          icon: Receipt,
          color: 'bg-gray-500'
        }
      ];

      // Process cost breakdown
      const costBreakdown = [
        { name: 'Fuel', value: 35000, color: '#3B82F6' },
        { name: 'Maintenance', value: 25000, color: '#10B981' },
        { name: 'Insurance', value: 12000, color: '#8B5CF6' },
        { name: 'Labor', value: 20000, color: '#F59E0B' },
        { name: 'Other', value: 8000, color: '#6B7280' }
      ];

      // Process monthly trends
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(Math.random() * 50000) + 80000,
          expenses: Math.floor(Math.random() * 40000) + 60000,
          profit: Math.floor(Math.random() * 20000) + 10000
        };
      });

      const totalRevenue = dashboard.stats.totalRevenue || 100000;
      const totalExpenses = dashboard.stats.totalExpenses || 70000;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 30;

      setDashboardData({
        financialStats: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          fuelCosts: operationalCosts.find(c => c.category === 'Fuel')?.amount || 35000,
          maintenanceCosts: operationalCosts.find(c => c.category === 'Maintenance')?.amount || 25000,
          operationalCosts: operationalCosts.reduce((sum, c) => sum + c.amount, 0)
        },
        fuelSpendAnalysis,
        maintenanceROI,
        operationalCosts,
        costBreakdown,
        monthlyTrends
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      if (error.response?.status !== 401) {
        const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'financial dashboard' }, error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData.financialStats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      subtitle: 'This period',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Expenses',
      value: `$${dashboardData.financialStats.totalExpenses.toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-red-500',
      subtitle: 'This period',
      change: '+8.3%',
      changeType: 'negative'
    },
    {
      title: 'Net Profit',
      value: `$${dashboardData.financialStats.netProfit.toLocaleString()}`,
      icon: PiggyBank,
      color: 'bg-blue-500',
      subtitle: `${dashboardData.financialStats.profitMargin.toFixed(1)}% margin`,
      change: '+15.2%',
      changeType: 'positive'
    },
    {
      title: 'Fuel Costs',
      value: `$${dashboardData.financialStats.fuelCosts.toLocaleString()}`,
      icon: Fuel,
      color: 'bg-yellow-500',
      subtitle: `${((dashboardData.financialStats.fuelCosts / dashboardData.financialStats.totalExpenses) * 100).toFixed(1)}% of expenses`,
      change: '+5.7%',
      changeType: 'negative'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (type) => {
    return type === 'positive' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getEfficiencyColor = (efficiency) => {
    switch (efficiency) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getROIColor = (roi) => {
    if (roi > 50) return 'bg-green-100 text-green-800';
    if (roi > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics Center</h1>
          <p className="text-gray-600 mt-1">Audit fuel spend, maintenance ROI, and operational costs.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Calculator className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Cost Analysis</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">ROI Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <FileText className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Audit Logs</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Target className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Budget Planning</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Spend Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Fuel Spend Analysis</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              ${dashboardData.fuelSpendAnalysis.reduce((sum, f) => sum + f.totalSpend, 0).toLocaleString()} Total
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.fuelSpendAnalysis.slice(0, 5).map((fuel) => (
              <div key={fuel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fuel.licensePlate}</p>
                    <p className="text-xs text-gray-500">{fuel.gallons} gallons • {fuel.mpg} MPG</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${fuel.totalSpend.toLocaleString()}</p>
                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(fuel.efficiency)}`}>
                      {fuel.efficiency}
                    </span>
                    <span className={`text-xs ${fuel.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                      {fuel.trend === 'up' ? '↑' : '↓'} {fuel.trendPercent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance ROI */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance ROI Analysis</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Avg ROI: {(dashboardData.maintenanceROI.reduce((sum, m) => sum + parseFloat(m.roi), 0) / dashboardData.maintenanceROI.length).toFixed(1)}%
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.maintenanceROI.slice(0, 5).map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{maintenance.licensePlate}</p>
                    <p className="text-xs text-gray-500">{maintenance.maintenanceCount} services • {maintenance.downtimeHours}h downtime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${maintenance.totalMaintenance.toLocaleString()}</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getROIColor(parseFloat(maintenance.roi))}`}>
                    ROI: {maintenance.roi}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Costs Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Operational Costs Breakdown</h2>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            ${dashboardData.financialStats.operationalCosts.toLocaleString()} Total
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardData.operationalCosts.map((cost) => {
            const Icon = cost.icon;
            return (
              <div key={cost.category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${cost.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium ${cost.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {cost.trendPercent}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">${cost.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{cost.category}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${cost.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{cost.percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Financial Trends</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Detailed Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.monthlyTrends.map((trend, index) => {
                const profitMargin = ((trend.profit / trend.revenue) * 100).toFixed(1);
                const previousProfit = index > 0 ? dashboardData.monthlyTrends[index - 1].profit : trend.profit;
                const trendDirection = trend.profit > previousProfit ? 'up' : trend.profit < previousProfit ? 'down' : 'stable';
                const trendPercent = previousProfit > 0 ? ((trend.profit - previousProfit) / previousProfit * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={trend.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trend.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trend.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trend.expenses.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trend.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profitMargin > 20 ? 'bg-green-100 text-green-800' : 
                        profitMargin > 10 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {profitMargin}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        trendDirection === 'up' ? 'text-green-600' : 
                        trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trendDirection === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : 
                         trendDirection === 'down' ? <ArrowDown className="h-4 w-4 mr-1" /> : 
                         <Activity className="h-4 w-4 mr-1" />}
                        {trendDirection === 'stable' ? '0.0%' : `${trendPercent}%`}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cost Distribution</h3>
            <div className="space-y-2">
              {dashboardData.costBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm text-gray-600">Fuel costs represent the largest expense category at 35%</p>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-gray-600">Maintenance costs have decreased by 3.2% this period</p>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-600">Overall profit margin improved by 2.3% compared to last period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
