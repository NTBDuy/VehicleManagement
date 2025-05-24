import User from "./User";
import Vehicle from "./Vehicle";

export enum status {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3
}

export default interface Request {
    requestId: number;
    userId: number;
    vehicleId: number;
    startTime: string;
    endTime: string;
    purpose: string;
    status: status;
    isDriverRequired: boolean;
    createdAt: string;
    User?: User;
    Vehicle?: Vehicle
}