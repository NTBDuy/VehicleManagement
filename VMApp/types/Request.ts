import User from "types/User";
import Vehicle from "types/Vehicle";

export enum Status {
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
    status: Status;
    isDriverRequired: boolean;
    createdAt: string;
    lastUpdateAt: string;
    cancelOrRejectReason?: string;
    user?: User;
    vehicle?: Vehicle
}