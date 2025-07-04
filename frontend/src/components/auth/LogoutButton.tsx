import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      authService.clearAuthTokens();
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${className}`}
    >
      Sign out
    </button>
  );
};

export default LogoutButton;
