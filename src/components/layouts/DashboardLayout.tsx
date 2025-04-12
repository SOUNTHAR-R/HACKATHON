import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const getTabs = () => {
    switch (user?.role) {
      case 'student':
        return [
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'lecture-notes', name: 'Lecture Notes', icon: '📚' },
          { id: 'attendance', name: 'Attendance', icon: '📅' },
          { id: 'marks', name: 'Marks & Performance', icon: '📈' },
          { id: 'quizzes', name: 'Quizzes', icon: '✍️' },
          { id: 'calendar', name: 'Calendar', icon: '🗓️' }
        ];
      case 'teacher':
        return [
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'lecture-management', name: 'Lecture Management', icon: '📚' },
          { id: 'attendance', name: 'Attendance', icon: '📅' },
          { id: 'marks', name: 'Marks & Performance', icon: '📈' },
          { id: 'assignments', name: 'Assignments', icon: '📝' },
          { id: 'quizzes', name: 'AI Quizzes', icon: '✍️' },
          { id: 'announcements', name: 'Announcements', icon: '📢' }
        ];
      case 'parent':
        return [
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'academic', name: 'Academic Performance', icon: '📚' },
          { id: 'attendance', name: 'Attendance', icon: '📅' },
          { id: 'assignments', name: 'Assignments', icon: '📝' },
          { id: 'exams', name: 'Exam Schedule', icon: '📅' }
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.role} Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white hover:shadow-md bg-white/90'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 