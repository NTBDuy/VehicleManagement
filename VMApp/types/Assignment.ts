import Driver from "types/Driver";

export default interface Assignment {
    assignmentId: number;
    requestId: number;
    driverId: number;
    driver: Driver
    note: string;
}