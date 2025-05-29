import { BaseApiClient } from 'services/baseApiClient';
import Driver from 'types/Driver';

export class DriverService extends BaseApiClient {
  // Lấy tất cả drivers
  static async getAllDrivers(): Promise<Driver[]> {
    return this.request<Driver[]>('/driver');
  }
}
