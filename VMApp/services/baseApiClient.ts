import { showToast } from 'utils/toast';
import { API_CONFIG } from 'config/apiConfig';
import { AuthService } from 'services/authService'

export class BaseApiClient {
  protected static readonly BASE_URL = API_CONFIG.BASE_URL;

  protected static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await AuthService.getAuthHeaders();

    console.log('Requesting:', {
      url: `${this.BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      body: options.body,
    });

    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Unauthorized. Logging out...');
        await AuthService.logout();
        throw new Error('Session expired. Please login again.');
      }

      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        showToast.error('Error', errorMessage);
      } catch (e) {
        console.warn('Error parsing JSON:', e);
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response JSON:', data);
      return data;
    }

    const text = await response.text();
    console.log('Response Text:', text);
    return text as unknown as T;
  }
}