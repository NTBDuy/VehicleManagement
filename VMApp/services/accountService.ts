import { BaseApiClient } from './baseApiClient';
import User from '../types/User';

export class AccountService extends BaseApiClient {
  // Lấy danh sách tài khoản
  static async getAllAccounts(): Promise<User[]> {
    return this.request<User[]>('/account');
  }

  // Lấy thông tin chi tiết xe
  static async getAccountById(id: number): Promise<User> {
    return this.request<User>(`/account/${id}`);
  }

  // Tạo mới tài khoản
  static async createAccount(accountData: Partial<User>): Promise<User> {
    return this.request<User>('/account', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  // Cập nhật thông tin tài khoản
  static async updateAccount(id: number, accountData: Partial<User>): Promise<User> {
    return this.request<User>(`/account/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  // Xóa tài khoản
  static async deleteAccount(id: number): Promise<void> {
    return this.request<void>(`/account/${id}`, {
      method: 'DELETE',
    });
  }
}
