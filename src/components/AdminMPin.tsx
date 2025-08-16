import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import FuturisticBackground from './FuturisticBackground';
import FuturisticCursor from './FuturisticCursor';

const AdminMPin: React.FC = () => {
  const navigate = useNavigate();
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_MPIN = '180623';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (mpin === ADMIN_MPIN) {
        localStorage.setItem('admin_mpin_authenticated', 'true');
        localStorage.setItem('admin_mpin_timestamp', Date.now().toString());
        navigate('/admin/dashboard');
      } else {
        setError('Invalid M-PIN. Access denied.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setMpin(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <FuturisticBackground />
      <FuturisticCursor />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Shield className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-white">Admin Access</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Enter M-PIN</h2>
          <p className="text-gray-400">Secure access for administrators</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">6-Digit M-PIN</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={mpin}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="••••••"
                  maxLength={6}
                  required
                />
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                Enter your 6-digit M-PIN to access admin dashboard
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || mpin.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Access Admin Dashboard
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400">
              <p>🔒 Secure M-PIN authentication</p>
              <p>Contact system administrator for access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMPin;