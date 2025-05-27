import { BaseApiClient } from './baseApiClient';

export class NotificationService extends BaseApiClient {
  // Cập nhật trạng thái
  static async makeRead(id: number): Promise<void> {
    return this.request<void>(`/notification/${id}/mark-read`, {
      method: 'PUT',
    });
  }
}
