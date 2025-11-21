import React, { useEffect } from 'react';
import { LogOut, User, Home, BarChart3 } from 'lucide-react';
import useBudgetStore from './store/budgetStore';
import { authService } from './services/api';
import Login from './components/Login';
import BudgetForm from './components/BudgetForm';
import Dashboard from './components/Dashboard';

function App() {
  const { 
    isAuthenticated, 
    user, 
    logout, 
    setUser, 
    loadFromServer,
    isOnline 
  } = useBudgetStore();
  
  const [activeTab, setActiveTab] = React.useState('budget');

  useEffect(() => {
    // Check for stored auth token on app load
    const token = authService.getStoredToken();
    if (token && !isAuthenticated) {
      // Decode token to get user info (simplified)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.userId }, token);
        } else {
          authService.logout();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        authService.logout();
      }
    }
  }, [isAuthenticated, setUser]);

  useEffect(() => {
    // Load data from server when authenticated and online
    if (isAuthenticated && isOnline) {
      loadFromServer().catch(console.error);
    }
  }, [isAuthenticated, isOnline, loadFromServer]);

  const handleLogout = () => {
    authService.logout();
    logout();
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="text-indigo-600" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">BudgetBox</h1>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{user.email}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('budget')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'budget'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home size={16} />
                Budget Form
              </div>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                Dashboard
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'budget' && <BudgetForm />}
        {activeTab === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;
