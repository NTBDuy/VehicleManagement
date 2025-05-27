export enum status {
  Available = 0,
  InUse = 1,
  UnderMaintenance = 2
}

export default interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  type: string;
  brand: string;
  model: string;
  status: status;
  lastMaintenance?: string;
  nextMaintenance?: string;
  nextMaintenanceId?: number;
  createAt?: string;
  lastUpdateAt?: string;
}