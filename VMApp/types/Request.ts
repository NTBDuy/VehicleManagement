import User from "types/User";
import Vehicle from "types/Vehicle";
import { LocationType } from "@/types/Location";

export enum Status {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3,
    InProgress = 4,
    Done = 5
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
    actionBy: number;
    actionByUser: User;
    cancelOrRejectReason?: string;
    totalDistance?: number;
    user?: User;
    vehicle?: Vehicle,
    locations: LocationType[],
}