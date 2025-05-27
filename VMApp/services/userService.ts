import { BaseApiClient } from './baseApiClient';
import User from '../types/User';
import Request from '../types/Request';
import Notification from 'types/Notification';

export class UserService extends BaseApiClient {
  // Cập nhật profile user
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>(`/user/information`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Lấy danh sách requests của user
  static async getUserRequests(): Promise<Request[]> {
    return this.request<Request[]>(`/user/requests`);
  }

  // Lấy danh sách thông báo của user
  static async getUserNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>(`/user/notifications`);
  }

  
  static async getUserUnreadNotifications(): Promise<number> {
    return this.request<number>(`/user/notifications/count-unread`);
  }
}
