export default interface Notification {
    NotificationId: number;
    UserId: number;
    Message: string;
    Type: string;
    CreatedAt: string;
    IsRead: boolean;
}