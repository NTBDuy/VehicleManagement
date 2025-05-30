import { BaseApiClient } from 'services/baseApiClient';
import Vehicle from 'types/Vehicle';
import MaintenanceSchedule from 'types/MaintenanceSchedule';

export class VehicleService extends BaseApiClient {
  // Lấy danh sách phương tiện
  static async getAllVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicle');
  }

  // Lấy thông tin chi tiết phương tiện
  static async getVehicleById(id: number): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicle/${id}`);
  }

  // Lấy danh sách phương tiện available
  static async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicle/available');
  }

  // Lấy danh sách lịch trình của phương tiện
  static async getVehicleSchedule(id: number): Promise<Request[]> {
    return this.request<Request[]>(`/vehicle/${id}/schedule`);
  }

  // Lấy tất cả lịch bảo dưỡng
  static async getAllMaintenance(): Promise<MaintenanceSchedule[]> {
    return this.request<MaintenanceSchedule[]>('/vehicle/maintenance');
  }

  // Tạo mới phương tiện
  static async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicle', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  // Tạo lịch bảo dưỡng cho phương tiện
  static async scheduleMaintenance(id: number, scheduleData: any): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>(`/vehicle/${id}/maintenance/schedule`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  // Cập nhật thông tin phương tiện
  static async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicle/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  // Thay đổi lịch bảo dưỡng xe
  static async rescheduleMaintenance(
    id: number,
    maintenanceData: any
  ): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>(`/vehicle/maintenance/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData),
    });
  }

  // Cập nhật trạng thái bảo dưỡng
  static async changeStatusMaintenance(
    id: number,
    status: number
  ): Promise<MaintenanceSchedule> {
    return this.request<MaintenanceSchedule>(`/vehicle/maintenance/${id}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  // Xóa phương tiện
  static async deleteVehicle(id: number): Promise<void> {
    return this.request<void>(`/vehicle/${id}`, {
      method: 'DELETE',
    });
  }
}
