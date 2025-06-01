import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from 'config/apiConfig';
import { LoginRequest } from 'types/LoginRequest';
import { LoginResponse } from 'types/LoginResponse';
import User from 'types/User';
import { showToast } from 'utils/toast';

export class AuthService {
  protected static readonly BASE_URL = API_CONFIG.BASE_URL;

  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      showToast.success('Login succesfully', `Welcome ${data.user.fullName}!`);

      await AsyncStorage.setItem(this.TOKEN_KEY, data.token);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

      return data;
    } catch (error) {
      throw error;
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
