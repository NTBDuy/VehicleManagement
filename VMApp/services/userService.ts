import { BaseApiClient } from 'services/baseApiClient';
import User from 'types/User';
import Request from 'types/Request';
import Notification from 'types/Notification';

export class UserService extends BaseApiClient {
  // Lấy danh sách người dùng
  static async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/user');
  }

  // Lấy thông tin chi tiết người dùng
  static async getUserById(id: number): Promise<User> {
    return this.request<User>(`/user/${id}`);
  }

  // Cập nhật thông tin người dùng
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>(`/user/information`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Lấy danh sách requests của người dùng
  static async getUserRequests(
    startDate?: string,
    endDate?: string,
  ): Promise<Request[]> {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<Request[]>(`/user/requests?${params.toString()}`);
  }

  // Lấy danh sách thông báo của người dùng
  static async getUserNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>(`/user/notifications`);
  }

  // Lấy số lượng thông báo chưa đọc
  static async getUserUnreadNotifications(): Promise<number> {
    return this.request<number>(`/user/notifications/count-unread`);
  }

  // Tạo mới người dùng
  static async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Cập nhật thông tin người dùng
  static async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Thay đổi trạng thái người dùng
  static async toggleStatus(id: number): Promise<void> {
    return this.request<void>(`/user/${id}/toggle-status`, {
      method: 'PUT',
    });
  }

  // Reset mật khẩu cho người dùng
  static async reset(id: number): Promise<void> {
    return this.request<void>(`/user/${id}/reset-password`, {
      method: 'PUT',
    });
  }

  // Thay đổi mật khẩu
  static async changePassword(data: any): Promise<void> {
    return this.request<void>(`/user/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
