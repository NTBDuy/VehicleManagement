import { showToast } from 'utils/toast';
import { API_CONFIG } from 'config/apiConfig';
import { AuthService } from 'services/authService';

export class BaseApiClient {
  private static onUnauthorized: (() => void) | null = null;

  public static setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  protected static readonly BASE_URL = API_CONFIG.BASE_URL;

  protected static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await AuthService.getAuthHeaders();

    console.log('Requesting:', {
      url: `${this.BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      body: options.body,
    });

    let response: Response;
    try {
      response = await fetch(`${this.BASE_URL}${endpoint}`, {
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

      showToast.error(response.status === 401 ? 'Unauthorized' : 'Error', errorMessage);
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
