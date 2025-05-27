import { BaseApiClient } from './baseApiClient';
import Vehicle from '../types/Vehicle';
import MaintenanceSchedule from 'types/MaintenanceSchedule';

export class VehicleService extends BaseApiClient {
  // Lấy danh sách xe
  static async getAllVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicle');
  }

  // Lấy thông tin chi tiết xe
  static async getVehicleById(id: number): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicle/${id}`);
  }

  // Lấy danh sách xe available
  static async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicle/available');
  }

  static async getVehicleSchedule(id: number): Promise<Request[]> {
    return this.request<Request[]>(`/vehicle/${id}/schedule`);
  }

  // Tạo mới xe
  static async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicle', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  static async scheduleMaintenance(id: number, scheduleData: any): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>(`/vehicle/${id}/schedule-maintenance`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  // Cập nhật thông tin xe
  static async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicle/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  // Xóa vehicle
  static async deleteVehicle(id: number): Promise<void> {
    return this.request<void>(`/vehicle/${id}`, {
      method: 'DELETE',
    });
  }
}
