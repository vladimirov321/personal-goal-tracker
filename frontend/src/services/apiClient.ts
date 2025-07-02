import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: 10000
    });

    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.addAuthTokenToRequest(config),
      (error) => Promise.reject(error)
    );
    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleApiError(error)
    );
  }

  private addAuthTokenToRequest(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private async handleApiError(error: AxiosError): Promise<any> {
    if (!error.response) {
      return Promise.reject({
        status: 'network_error',
        message: 'Network error – please check your connection'
      });
    }

    const { status, data } = error.response as AxiosResponse;

    if (status === 401) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        this.clearAuthTokens();
        return Promise.reject({
          status: 'unauthorized',
          message: 'Your session has expired, please log in again'
        });
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken
        });
        const { access_token, refresh_token } = response.data;
        this.setAuthTokens(access_token, refresh_token);
        if (error.config) {
          return this.api(error.config);
        }
      } catch {
        this.clearAuthTokens();
        return Promise.reject({
          status: 'session_expired',
          message: 'Your session has expired, please log in again'
        });
      }
    }

    return Promise.reject({
      status,
      message: (data && (data as any).message) || 'An unexpected error occurred',
      data
    });
  }

  public setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  public clearAuthTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const resp = await this.api.get<T>(url, config);
    return resp.data;
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.api.post<T>(url, data, config);
    return resp.data;
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.api.put<T>(url, data, config);
    return resp.data;
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.api.patch<T>(url, data, config);
    return resp.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const resp = await this.api.delete<T>(url, config);
    return resp.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
