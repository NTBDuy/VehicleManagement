import { BaseApiClient } from './baseApiClient';
import Vehicle from '../types/Vehicle';

export class VehicleService extends BaseApiClient {
  // Lấy danh sách xe available
  static async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicle/available');
  }
}
