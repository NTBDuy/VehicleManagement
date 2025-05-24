import User from "./User";

export default interface Notification {
    notificationId: number;
    userId: number;
    User?: User;
    message: string;
    type: string;
    createdAt: string;
    isRead: boolean;
}