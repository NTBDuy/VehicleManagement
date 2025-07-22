import { showToast } from 'utils/toast';
import { AuthService } from 'services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BaseApiClient {
  private static onUnauthorized: (() => void) | null = null;

  public static setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private static async getBaseUrl(): Promise<string> {
    const gateway = await AsyncStorage.getItem('gateway');
    return `http://${gateway}/api`;
  }

  protected static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await AuthService.getAuthHeaders();
    const baseURL = await this.getBaseUrl();
    const fullUrl = `${baseURL}${endpoint}`;

    console.log('Requesting:', {
      url: fullUrl,
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      body: options.body,
    });

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...options.headers,
          ...headers,
        },
      });
    } catch (e: any) {
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      showToast.error('Network Error', e.message || 'Connection failed');
      throw e;
    }

    console.log('Response status:', response.status);

    if (response.status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
    }

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      showToast.error(response.status === 401 ? 'Unauthorized' : errorMessage);
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
