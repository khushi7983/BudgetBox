import React, { useEffect, useState } from 'react';
import { DollarSign, Save, Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import useBudgetStore from '../store/budgetStore';

const BudgetForm = () => {
  const {
    budget,
    updateBudgetField,
    syncStatus,
    isOnline,
    hasUnsyncedChanges,
    syncWithServer,
    isLoading,
    error,
    lastSyncTime
  } = useBudgetStore();

  const [localValues, setLocalValues] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  useEffect(() => {
    setLocalValues({
      income: budget.income || '',
      monthlyBills: budget.monthlyBills || '',
      food: budget.food || '',
      transport: budget.transport || '',
      subscriptions: budget.subscriptions || '',
      miscellaneous: budget.miscellaneous || ''
    });
  }, [budget]);

  const handleFieldChange = (field, value) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
    
    // Auto-save with debounce
    clearTimeout(window.autoSaveTimeout);
    setAutoSaveStatus('Saving...');
    
    window.autoSaveTimeout = setTimeout(() => {
      updateBudgetField(field, value);
      setAutoSaveStatus('Saved locally');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 500);
  };

  const handleSync = async () => {
    try {
      await syncWithServer();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const getSyncStatusInfo = () => {
    switch (syncStatus) {
      case 'local':
        return {
          icon: <Save className="text-blue-500" size={16} />,
          text: 'Local Only',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'pending':
        return {
          icon: <Clock className="text-yellow-500" size={16} />,
          text: 'Sync Pending',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'synced':
        return {
          icon: <CheckCircle className="text-green-500" size={16} />,
          text: 'Synced',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      default:
        return {
          icon: <AlertCircle className="text-gray-500" size={16} />,
          text: 'Unknown',
          color: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  const statusInfo = getSyncStatusInfo();

  const budgetFields = [
    {
      key: 'income',
      label: 'Monthly Income',
      description: 'Your total monthly income',
      icon: '💰',
      placeholder: '50000'
    },
    {
      key: 'monthlyBills',
      label: 'Monthly Bills',
      description: 'Rent, EMI, utilities',
      icon: '🏠',
      placeholder: '15000'
    },
    {
      key: 'food',
      label: 'Food',
      description: 'Groceries + dining',
      icon: '🍽️',
      placeholder: '8000'
    },
    {
      key: 'transport',
      label: 'Transport',
      description: 'Fuel, cab, commute',
      icon: '🚗',
      placeholder: '5000'
    },
    {
      key: 'subscriptions',
      label: 'Subscriptions',
      description: 'OTT, SaaS, apps',
      icon: '📱',
      placeholder: '2000'
    },
    {
      key: 'miscellaneous',
      label: 'Miscellaneous',
      description: 'Other expenses',
      icon: '📝',
      placeholder: '3000'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <DollarSign className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monthly Budget</h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Sync Status and Controls */}
        <div className="flex items-center gap-3">
          {/* Online/Offline Indicator */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Sync Status */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.text}
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={!isOnline || isLoading || !hasUnsyncedChanges}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Sync
          </button>
        </div>
      </div>

      {/* Auto-save status */}
      {autoSaveStatus && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">{autoSaveStatus}</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Budget Form */}
      <div className="space-y-6">
        {budgetFields.map((field) => (
          <div key={field.key} className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">{field.icon}</span>
                {field.label}
              </span>
              <span className="text-xs text-gray-500 font-normal ml-7">{field.description}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">₹</span>
              </div>
              <input
                type="number"
                value={localValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:border-gray-400"
                placeholder={field.placeholder}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Last sync info */}
      {lastSyncTime && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last synced: {new Date(lastSyncTime).toLocaleString()}
          </p>
        </div>
      )}

      {/* Offline message */}
      {!isOnline && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            You're offline. Changes are saved locally and will sync when you're back online.
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetForm;