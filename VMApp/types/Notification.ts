import User from "./User";

export default interface Notification {
    NotificationId: number;
    UserId: number;
    User?: User;
    Message: string;
    Type: string;
    CreatedAt: string;
    IsRead: boolean;
}