import { BaseApiClient } from './baseApiClient';

export class NotificationService extends BaseApiClient {
  // Tạo mới thông báo
  static async createNewNotification(notificationData: any): Promise<Notification> {
    return this.request<Notification>('/notification', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // Đánh dấu thông báo đã đọc
  static async makeRead(id: number): Promise<void> {
    return this.request<void>(`/notification/${id}/mark-read`, {
      method: 'PUT',
    });
  }

  // Đánh dấu đã đọc tất cả thông báo 
  static async makeAllRead(): Promise<void> {
    return this.request<void>(`/notification/mark-all-read`, {
      method: 'PUT',
    });
  }
}

// Gửi thông báo
export const sendNotification = async ({
  userId,
  message,
  type,
}: {
  userId?: number;
  message: string;
  type: string;
}) => {
  if (!userId) {
    console.log('sendNotification aborted: userId is missing');
    return;
  }

  console.log('Sending notification with:', { userId, message, type });

  try {
    await NotificationService.createNewNotification({ userId, message, type });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
