import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { login } from '../services/api';
import { LoginFormData, UserRole } from '../types/auth';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserRole>('Student');
  const [formData, setFormData] = useState<LoginFormData>({
    regno: '',
    password: '',
    role: 'Student',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      role: activeTab,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await login(formData);
      const displayName = 'name' in response.user ? response.user.name : response.user.student_regno;
      toast.success(`Welcome back, ${displayName}!`);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const tabClasses = (tab: UserRole) =>
    `px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
      activeTab === tab
        ? 'bg-white text-blue-700 shadow-sm rounded-t-xl border-2 border-blue-600 ring ring-blue-300'
        : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t-xl'
    }`;

  const inputClasses = 
    "w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-white to-pink-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <Toaster position="top-center" />
      <div className="w-full max-w-md relative">
        <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300">
          {/* Welcome Message */}
          <div className="text-center pt-8 pb-4">
            <h1 className="text-3xl font-extrabold text-purple-700 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Please sign in to continue
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 flex justify-between rounded-t-xl">
            {(['Student', 'Teacher', 'Parent'] as UserRole[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setFormData(prev => ({ ...prev, role: tab, password: '' }));
                }}
                className={tabClasses(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {activeTab === 'Parent' ? "Student's Registration Number" : "Registration Number"}
              </label>
              <input
                type="text"
                name="regno"
                value={formData.regno}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Enter registration number"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {activeTab === 'Teacher' ? 'Password' : 'Date of Birth (DDMMYYYY)'}
              </label>
              <input
                type={activeTab === 'Teacher' ? 'password' : 'text'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder={activeTab === 'Teacher' ? 'Enter password' : 'DDMMYYYY'}
                pattern={activeTab === 'Teacher' ? undefined : '\\d{8}'}
                title={activeTab === 'Teacher' ? undefined : 'Please enter date in DDMMYYYY format'}
                required
              />
              {activeTab !== 'Teacher' && (
                <p className="text-xs text-gray-500 mt-1">
                  Enter your date of birth in DDMMYYYY format (e.g., 01011001 for 1st Jan 1001)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-medium rounded-xl transition-all duration-300 transform
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:bg-blue-600 hover:shadow-lg hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
