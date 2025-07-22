export interface VehicleUsageData {
  licensePlate: string;
  count: number;
  totalDistance: number;
}

export interface DailyData {
  date: string;
  count: number;
}

export interface UserUsageData {
  username: string;
  count: number;
}
