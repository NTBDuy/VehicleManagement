import { AuthService } from 'services/authService';
import User from 'types/User';
import Vehicle from 'types/Vehicle';

export class ApiClient {
  private static readonly BASE_URL = 'http://192.168.2.150:5169/api';

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await AuthService.getAuthHeaders();

    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await AuthService.logout();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  static async getUserProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  static async updateUserProfile(userId: number, userData: any): Promise<User> {
    return this.request<User>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async getVailableVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicle/available');
  }
}
