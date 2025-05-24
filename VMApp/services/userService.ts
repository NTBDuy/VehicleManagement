import { BaseApiClient } from './baseApiClient';
import User from '../types/User';
import Request from '../types/Request';

export class UserService extends BaseApiClient {
  // Cập nhật profile user
  static async updateProfile(userId: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Lấy danh sách requests của user
  static async getUserRequests(userId: number): Promise<Request[]> {
    return this.request<Request[]>(`/user/${userId}/requests`);
  }
}
