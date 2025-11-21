import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import useBudgetStore from '../store/budgetStore';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('hire-me@anshumat.org');
  const [password, setPassword] = useState('HireMe@2025!');
  const [showPassword, setShowPassword] = useState(false);
  
  const { setUser, isLoading, error, setError, setLoading, isOnline } = useBudgetStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token, user } = await authService.login(email, password);
      setUser(user, token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('hire-me@anshumat.org');
    setPassword('HireMe@2025!');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Online/Offline Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
              <LogIn className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BudgetBox</h1>
            <p className="text-gray-600">Local-First Personal Budgeting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Demo Account:</p>
            <div className="text-xs text-gray-500 mb-3">
              <p><strong>Email:</strong> hire-me@anshumat.org</p>
              <p><strong>Password:</strong> HireMe@2025!</p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Use Demo Credentials
            </button>
          </div>

          {!isOnline && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You're offline. The app will work locally and sync when you're back online.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;