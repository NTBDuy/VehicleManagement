import Setting from '@/types/Setting';
import { BaseApiClient } from 'services/baseApiClient';

export class SettingService extends BaseApiClient {
  // Lấy tất cả cài đặt
  static async getAllSettings(): Promise<Setting[]> {
    return this.request<Setting[]>('/setting');
  }

  // Lấy thông tin chi tiết cài đặt
  static async getSettingById(key: string): Promise<Setting> {
    return this.request<Setting>(`/setting/${key}`);
  }

  // Cập nhật thông tin cài đặt
  static async updateSetting(key: string, settingData: Partial<Setting>): Promise<Setting> {
    return this.request<Setting>(`/setting/${key}`, {
      method: 'PUT',
      body: JSON.stringify(settingData),
    });
  }
}
