import apiClient from './apiClient';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

class AuthService {
  private basePath = '/auth';
  async login(credentials: LoginPayload): Promise<User> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/login`, credentials);
    
    apiClient.setAuthTokens(response.access_token, response.refresh_token);
    
    return response.user;
  }
  
  async register(userData: RegisterPayload): Promise<User> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/register`, userData);
    
    apiClient.setAuthTokens(response.access_token, response.refresh_token);
    
    return response.user;
  }
  
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/logout`);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      apiClient.clearAuthTokens();
    }
  }
  
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(`${this.basePath}/profile`);
  }

  isLoggedIn(): boolean {
    return apiClient.isAuthenticated();
  }
}

const authService = new AuthService();
export default authService;
