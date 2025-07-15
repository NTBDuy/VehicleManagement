import DriverFormData from '@/types/DriverFormData';
import { BaseApiClient } from 'services/baseApiClient';
import Driver from 'types/Driver';
import Request from '@/types/Request';

export class DriverService extends BaseApiClient {
  // Lấy tất cả tài xế
  static async getAllDrivers(): Promise<Driver[]> {
    return this.request<Driver[]>('/driver');
  }

  // Lấy tài xế khả dụng
  static async getAvailableDrivers(startTime: string, endTime: string): Promise<Driver[]> {
    return this.request<Driver[]>(`/driver/available?startTime=${startTime}&endTime=${endTime}`);
  }

  // Lấy thông tin chi tiết tài xế
  static async getDriverById(id: number): Promise<Driver> {
    return this.request<Driver>(`/driver/${id}`);
  }

  static async getDriverRequestById(id: number): Promise<Request[]> {
    return this.request<Request[]>(`/driver/${id}/requests`);
  }

  // Tạo mới tài xế
  static async createDriver(driverData: DriverFormData): Promise<Driver> {
    return this.request<Driver>('/driver', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  // Cập nhật thông tin tài xế
  static async updateDriver(id: number, driverData: Partial<Driver>): Promise<Driver> {
    return this.request<Driver>(`/driver/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  }

  // Thay đổi trạng thái tài xế
  static async toggleStatus(id: number): Promise<void> {
    return this.request<void>(`/driver/${id}/toggle-status`, {
      method: 'PUT',
    });
  }
}
