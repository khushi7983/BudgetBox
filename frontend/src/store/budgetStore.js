import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Configure localforage
localforage.config({
  name: 'BudgetBox',
  storeName: 'budgetData',
  description: 'Local-first budget data storage'
});

// Custom storage implementation for zustand
const localforageStorage = {
  getItem: async (name) => {
    const value = await localforage.getItem(name);
    return value || null;
  },
  setItem: async (name, value) => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name) => {
    await localforage.removeItem(name);
  },
};

const useBudgetStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,

      // Budget data
      budget: {
        income: 0,
        monthlyBills: 0,
        food: 0,
        transport: 0,
        subscriptions: 0,
        miscellaneous: 0,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        lastUpdated: new Date().toISOString(),
        id: null
      },

      // Sync state
      syncStatus: 'local', // 'local', 'pending', 'synced'
      isOnline: navigator.onLine,
      hasUnsyncedChanges: false,
      lastSyncTime: null,

      // UI state
      isLoading: false,
      error: null,

      // Actions
      setUser: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        error: null
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        budget: {
          income: 0,
          monthlyBills: 0,
          food: 0,
          transport: 0,
          subscriptions: 0,
          miscellaneous: 0,
          month: new Date().toISOString().slice(0, 7),
          lastUpdated: new Date().toISOString(),
          id: null
        },
        syncStatus: 'local',
        hasUnsyncedChanges: false,
        lastSyncTime: null
      }),

      setOnlineStatus: (isOnline) => set({ isOnline }),

      updateBudgetField: (field, value) => {
        const state = get();
        const newBudget = {
          ...state.budget,
          [field]: parseFloat(value) || 0,
          lastUpdated: new Date().toISOString()
        };

        set({
          budget: newBudget,
          hasUnsyncedChanges: true,
          syncStatus: state.isOnline ? 'pending' : 'local'
        });

        // Auto-save to IndexedDB immediately
        localforage.setItem('budget-auto-save', newBudget);
      },

      setBudget: (budgetData) => set({
        budget: {
          ...budgetData,
          lastUpdated: new Date().toISOString()
        }
      }),

      setSyncStatus: (status) => set({ syncStatus: status }),

      setError: (error) => set({ error }),

      setLoading: (isLoading) => set({ isLoading }),

      // Calculate analytics
      getAnalytics: () => {
        const { budget } = get();
        const totalExpenses = budget.monthlyBills + budget.food + budget.transport + budget.subscriptions + budget.miscellaneous;
        
        return {
          totalExpenses,
          burnRate: budget.income > 0 ? (totalExpenses / budget.income) * 100 : 0,
          savingsPotential: budget.income - totalExpenses,
          categories: [
            { name: 'Monthly Bills', value: budget.monthlyBills, color: '#FF6384' },
            { name: 'Food', value: budget.food, color: '#36A2EB' },
            { name: 'Transport', value: budget.transport, color: '#FFCE56' },
            { name: 'Subscriptions', value: budget.subscriptions, color: '#4BC0C0' },
            { name: 'Miscellaneous', value: budget.miscellaneous, color: '#9966FF' }
          ].filter(cat => cat.value > 0)
        };
      },

      // Get AI suggestions (rule-based)
      getAISuggestions: () => {
        const { budget } = get();
        const analytics = get().getAnalytics();
        const suggestions = [];

        if (budget.income === 0) {
          suggestions.push({
            type: 'warning',
            message: 'Please add your monthly income to get accurate insights.'
          });
          return suggestions;
        }

        // Food spending rules
        const foodPercentage = (budget.food / budget.income) * 100;
        if (foodPercentage > 40) {
          suggestions.push({
            type: 'warning',
            message: `Food expenses are ${foodPercentage.toFixed(1)}% of your income - consider reducing food spend next month.`
          });
        }

        // Subscription rules
        const subscriptionPercentage = (budget.subscriptions / budget.income) * 100;
        if (subscriptionPercentage > 30) {
          suggestions.push({
            type: 'warning',
            message: `Subscriptions are ${subscriptionPercentage.toFixed(1)}% of your income - too high! Consider cancelling unused apps.`
          });
        }

        // Savings rules
        if (analytics.savingsPotential < 0) {
          suggestions.push({
            type: 'error',
            message: 'Your expenses exceed income. Review and cut unnecessary spending immediately.'
          });
        } else if (analytics.savingsPotential < budget.income * 0.1) {
          suggestions.push({
            type: 'warning',
            message: 'Your savings rate is below 10%. Try to increase your savings for better financial health.'
          });
        } else if (analytics.savingsPotential > budget.income * 0.3) {
          suggestions.push({
            type: 'success',
            message: 'Excellent! You\'re saving over 30% of your income. Consider investing the surplus.'
          });
        }

        // Transport rules
        const transportPercentage = (budget.transport / budget.income) * 100;
        if (transportPercentage > 20) {
          suggestions.push({
            type: 'info',
            message: `Transport costs are ${transportPercentage.toFixed(1)}% of income. Consider carpooling or public transport.`
          });
        }

        // Overall burn rate
        if (analytics.burnRate > 90) {
          suggestions.push({
            type: 'error',
            message: `High burn rate of ${analytics.burnRate.toFixed(1)}%! You need to reduce expenses urgently.`
          });
        } else if (analytics.burnRate < 50) {
          suggestions.push({
            type: 'success',
            message: `Great job! Your burn rate is only ${analytics.burnRate.toFixed(1)}%. You have excellent spending control.`
          });
        }

        return suggestions.length > 0 ? suggestions : [{
          type: 'success',
          message: 'Your budget looks balanced! Keep up the good work.'
        }];
      },

      // Sync data with server
      syncWithServer: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.token) {
          throw new Error('Not authenticated');
        }

        set({ isLoading: true, error: null });

        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${API_BASE_URL}/budget/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(state.budget)
          });

          if (!response.ok) {
            throw new Error('Sync failed');
          }

          const result = await response.json();
          
          set({
            syncStatus: 'synced',
            hasUnsyncedChanges: false,
            lastSyncTime: new Date().toISOString(),
            isLoading: false
          });

          return result;
        } catch (error) {
          set({
            syncStatus: 'pending',
            error: error.message,
            isLoading: false
          });
          throw error;
        }
      },

      // Load budget from server
      loadFromServer: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.token) {
          throw new Error('Not authenticated');
        }

        set({ isLoading: true, error: null });

        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${API_BASE_URL}/budget/latest`, {
            headers: {
              'Authorization': `Bearer ${state.token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to load budget');
          }

          const budgetData = await response.json();
          
          set({
            budget: budgetData,
            syncStatus: 'synced',
            hasUnsyncedChanges: false,
            lastSyncTime: new Date().toISOString(),
            isLoading: false
          });

          return budgetData;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });
          throw error;
        }
      }
    }),
    {
      name: 'budget-storage',
      storage: localforageStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        budget: state.budget,
        syncStatus: state.syncStatus,
        hasUnsyncedChanges: state.hasUnsyncedChanges,
        lastSyncTime: state.lastSyncTime
      }),
    }
  )
);

// Setup online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useBudgetStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useBudgetStore.getState().setOnlineStatus(false);
  });
}

export default useBudgetStore;