export enum status {
  Available = 0,
  InUse = 1,
  UnderMaintenance = 2
}

export default interface Vihicle {
  VehicleId: number;
  LicensePlate: string;
  Type: string;
  Brand: string;
  Model: string;
  Status: status;
  LastMaintenance?: string;
}