import React, { useEffect, useState } from 'react';
import { LogoutButton } from '../components/auth';
import authService from '../services/authService';
import { User } from '../services/authService';
import { GoalManager } from '../components/goals';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err: any) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (authService.isLoggedIn()) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Goal Tracker</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">Welcome{user?.username ? `, ${user.username}` : ''}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-gray-200 rounded-lg p-4 min-h-[24rem]">
            <GoalManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
