import Vehicle from 'types/Vehicle';

export enum maintenanceStatus {
  Pending = 0,
  InProgress = 1,
  Done = 2,
}
export default interface MaintenanceSchedule {
  maintenanceId: number;
  vehicleId: number;
  vehicle: Vehicle;
  scheduledDate: string;
  estimatedEndDate: string;
  description: string;
  status: maintenanceStatus;
  createdAt?: string;
  lastUpdateAt?: string;
}
