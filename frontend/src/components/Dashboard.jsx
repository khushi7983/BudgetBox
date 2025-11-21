import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, PieChart, BarChart } from 'lucide-react';
import useBudgetStore from '../store/budgetStore';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const { getAnalytics, getAISuggestions, budget } = useBudgetStore();
  const analytics = getAnalytics();
  const suggestions = getAISuggestions();

  // Pie chart data
  const pieData = {
    labels: analytics.categories.map(cat => cat.name),
    datasets: [
      {
        data: analytics.categories.map(cat => cat.value),
        backgroundColor: analytics.categories.map(cat => cat.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Bar chart data for monthly trend (mock data for demonstration)
  const barData = {
    labels: ['This Month', 'Projected'],
    datasets: [
      {
        label: 'Income',
        data: [budget.income, budget.income],
        backgroundColor: '#10B981',
      },
      {
        label: 'Expenses',
        data: [analytics.totalExpenses, analytics.totalExpenses * 1.1], // Projected 10% increase
        backgroundColor: '#EF4444',
      },
      {
        label: 'Savings',
        data: [analytics.savingsPotential, analytics.savingsPotential * 0.9], // Projected 10% decrease
        backgroundColor: '#3B82F6',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    },
  };

  // Month-end prediction calculation
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const monthProgress = currentDay / daysInMonth;
  const projectedMonthEndExpenses = analytics.totalExpenses / monthProgress;
  const projectedSavings = budget.income - projectedMonthEndExpenses;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Burn Rate */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="text-red-600" size={24} />
            </div>
            <span className={`text-2xl font-bold ${
              analytics.burnRate > 80 ? 'text-red-600' : 
              analytics.burnRate > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {analytics.burnRate.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🔥 Burn Rate</h3>
          <p className="text-sm text-gray-600">
            Total expenses vs income ratio
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                analytics.burnRate > 80 ? 'bg-red-500' : 
                analytics.burnRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(analytics.burnRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Savings Potential */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              {analytics.savingsPotential >= 0 ? 
                <TrendingUp className="text-green-600" size={24} /> :
                <TrendingDown className="text-red-600" size={24} />
              }
            </div>
            <span className={`text-2xl font-bold ${
              analytics.savingsPotential >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{Math.abs(analytics.savingsPotential).toLocaleString()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">💸 Savings Potential</h3>
          <p className="text-sm text-gray-600">
            {analytics.savingsPotential >= 0 ? 'Available to save' : 'Over budget'}
          </p>
          {budget.income > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {((analytics.savingsPotential / budget.income) * 100).toFixed(1)}% of income
            </p>
          )}
        </div>

        {/* Month-End Prediction */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <span className={`text-2xl font-bold ${
              projectedSavings >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{Math.abs(projectedSavings).toLocaleString()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Month-End Prediction</h3>
          <p className="text-sm text-gray-600">
            Projected {projectedSavings >= 0 ? 'savings' : 'deficit'}
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Month progress</span>
              <span>{(monthProgress * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${monthProgress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">🍰 Expense Breakdown</h3>
          </div>
          <div className="h-64">
            {analytics.categories.length > 0 ? (
              <Doughnut data={pieData} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No expense data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">📊 Monthly Overview</h3>
          </div>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="text-orange-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">⚠️ Smart Recommendations</h3>
        </div>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                suggestion.type === 'error' ? 'bg-red-50 border-red-400' :
                suggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                suggestion.type === 'success' ? 'bg-green-50 border-green-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <p className={`text-sm ${
                suggestion.type === 'error' ? 'text-red-800' :
                suggestion.type === 'warning' ? 'text-yellow-800' :
                suggestion.type === 'success' ? 'text-green-800' :
                'text-blue-800'
              }`}>
                {suggestion.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">₹{budget.income.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Monthly Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">₹{analytics.totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ₹{Math.max(0, analytics.savingsPotential).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Current Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{analytics.categories.length}</p>
            <p className="text-sm text-gray-600">Active Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;