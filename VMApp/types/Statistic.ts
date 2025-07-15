import User from './User';
import Vehicle from './Vehicle';

export interface VehicleUsageData {
  vehicle: Vehicle;
  count: number;
  totalDistance: number;
}

export interface DailyData {
  date: string;
  count: number;
}

export interface UserUsageData {
  user: User;
  count: number;
}
