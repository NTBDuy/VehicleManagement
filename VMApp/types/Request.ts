import User from "./User";
import Vehicle from "./Vehicle";

export enum status {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3
}

export default interface Request {
    RequestId: number;
    UserId: number;
    VehicleId: number;
    StartTime: string;
    EndTime: string;
    Purpose: string;
    Status: status;
    isDriverRequired: boolean;
    CreatedAt: string;
    User?: User;
    Vehicle?: Vehicle
}