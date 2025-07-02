import axios from 'axios';
import { ApiClient } from '../apiClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockApiInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
};

const ACCESS_TOKEN_KEY  = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeAll(() => {
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedAxios.create.mockReturnValue(mockApiInstance as any);
    
    mockApiInstance.interceptors.request.use.mockImplementation((success, error) => {
      return { request: success, error };
    });
    
    mockApiInstance.interceptors.response.use.mockImplementation((success, error) => {
      return { response: success, error };
    });

    client = new ApiClient();
  });

  describe('Token Management', () => {
    it('should set tokens correctly', () => {
      client.setAuthTokens('access', 'refresh');
      expect(localStorage.setItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, 'access');
      expect(localStorage.setItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'refresh');
    });

    it('should clear tokens correctly', () => {
      client.clearAuthTokens();
      expect(localStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    });

    it('isAuthenticated should return true if token exists', () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'some-token');
      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('HTTP Methods', () => {
    it('should call api.get and return data', async () => {
      const data = { message: 'ok' };
      mockApiInstance.get.mockResolvedValue({ data });
      const result = await client.get('/path');
      expect(mockApiInstance.get).toHaveBeenCalledWith('/path', undefined);
      expect(result).toEqual(data);
    });

    it('should call api.post and return data', async () => {
      const data = { id: 42 };
      mockApiInstance.post.mockResolvedValue({ data });
      const payload = { foo: 'bar' };
      const result = await client.post('/path', payload);
      expect(mockApiInstance.post)
        .toHaveBeenCalledWith('/path', payload, undefined);
      expect(result).toEqual(data);
    });
  });
});
