import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest } from 'types/LoginRequest';
import { LoginResponse } from 'types/LoginResponse';
import User from 'types/User';

interface ApiError {
  success: false;
  statusCode: number;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  private static async getBaseUrl(): Promise<string> {
    const gateway = await AsyncStorage.getItem('gateway');
    return `http://${gateway}/api`;
  }

  static async login(credentials: LoginRequest): Promise<LoginResponse | ApiError> {
    const baseURL = await this.getBaseUrl();

    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if ([400, 401, 423, 410].includes(response.status)) {
        return {
          success: false,
          statusCode: response.status,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
        };
      }

      const data: LoginResponse = await response.json();

      if (!data?.token || !data?.user) {
        return {
          success: false,
          statusCode: 500,
        };
      }

      await AsyncStorage.setItem(this.TOKEN_KEY, data.token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

      return data;
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
      };
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
  }

  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  static async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}
