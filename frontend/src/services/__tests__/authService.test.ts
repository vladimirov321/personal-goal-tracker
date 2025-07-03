import apiClient from '../apiClient';
import authService, { User, AuthResponse, LoginPayload, RegisterPayload } from '../authService';

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    isAuthenticated: jest.fn(),
    setAuthTokens: jest.fn(),
    clearAuthTokens: jest.fn()
  }
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'Test User',
    createdAt: '2023-01-01T00:00:00Z'
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should call apiClient.post with credentials and set auth tokens', async () => {
      const loginPayload: LoginPayload = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockedApiClient.post.mockResolvedValueOnce(mockAuthResponse);
      
      const result = await authService.login(loginPayload);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginPayload);
      expect(apiClient.setAuthTokens).toHaveBeenCalledWith(
        mockAuthResponse.access_token,
        mockAuthResponse.refresh_token
      );
      expect(result).toEqual(mockUser);
    });

    test('should throw error if login fails', async () => {
      const loginPayload: LoginPayload = {
        email: 'test@example.com',
        password: 'wrong-password'
      };
      const error = new Error('Invalid credentials');
      mockedApiClient.post.mockRejectedValueOnce(error);
      
      await expect(authService.login(loginPayload)).rejects.toThrow();
      expect(apiClient.setAuthTokens).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    test('should call apiClient.post with user data and set auth tokens', async () => {
      const registerPayload: RegisterPayload = {
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      mockedApiClient.post.mockResolvedValueOnce(mockAuthResponse);
      
      const result = await authService.register(registerPayload);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerPayload);
      expect(apiClient.setAuthTokens).toHaveBeenCalledWith(
        mockAuthResponse.access_token,
        mockAuthResponse.refresh_token
      );
      expect(result).toEqual(mockUser);
    });

    test('should throw error if registration fails', async () => {
      const registerPayload: RegisterPayload = {
        username: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };
      const error = new Error('Email already exists');
      mockedApiClient.post.mockRejectedValueOnce(error);
      
      await expect(authService.register(registerPayload)).rejects.toThrow();
      expect(apiClient.setAuthTokens).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    test('should call apiClient.post and clear auth tokens', async () => {
      mockedApiClient.post.mockResolvedValueOnce({});
      
      await authService.logout();
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(apiClient.clearAuthTokens).toHaveBeenCalled();
    });

    test('should still clear auth tokens even if logout API call fails', async () => {
      const error = new Error('Network error');
      mockedApiClient.post.mockRejectedValueOnce(error);
      
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      await authService.logout();
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(apiClient.clearAuthTokens).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error during logout:', error);
      
      console.error = originalConsoleError;
    });
  });

  describe('getCurrentUser', () => {
    test('should call apiClient.get and return user data', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockUser);
      
      const result = await authService.getCurrentUser();
      
      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockUser);
    });

    test('should throw error if get user profile fails', async () => {
      const error = new Error('Unauthorized');
      mockedApiClient.get.mockRejectedValueOnce(error);
      
      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('isLoggedIn', () => {
    test('should return true when user is authenticated', () => {
      mockedApiClient.isAuthenticated.mockReturnValueOnce(true);
      
      const result = authService.isLoggedIn();
      
      expect(result).toBe(true);
      expect(apiClient.isAuthenticated).toHaveBeenCalled();
    });

    test('should return false when user is not authenticated', () => {
      mockedApiClient.isAuthenticated.mockReturnValueOnce(false);
      
      const result = authService.isLoggedIn();
      
      expect(result).toBe(false);
      expect(apiClient.isAuthenticated).toHaveBeenCalled();
    });
  });
});
