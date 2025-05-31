import { BaseApiClient } from 'services/baseApiClient';
import Request from 'types/Request';
import Assignment from 'types/Assignment';

export class RequestService extends BaseApiClient {
  // Lấy tất cả yêu cầu
  static async getAllRequests(): Promise<Request[]> {
    return this.request<Request[]>('/request');
  }

  // Lấy thông tin gán định tài xế
  static async getAssignmentDetails(id: number): Promise<Assignment> {
    return this.request<Assignment>(`/request/${id}/assignment`);
  }

  // Tạo yêu cầu mới
  static async createRequest(requestData: any): Promise<Request> {
    return this.request<Request>('/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Chấp thuận yêu cầu
  static async approveRequest(id: number, approvalData?: any): Promise<Request> {
    return this.request<Request>(`/request/${id}/approve`, {
      method: 'PUT',
      body: approvalData ? JSON.stringify(approvalData) : undefined,
    });
  }

  // Huỷ bỏ yêu cầu
  static async cancelRequest(id: number, reason: any): Promise<Request> {
    return this.request<Request>(`/request/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(reason),
    });
  }

  // Start using vehicle
  static async usingVehicle(id: number): Promise<Request> {
    return this.request<Request>(`/request/${id}/start-using`, {
      method: 'PUT',
    });
  }

  // End usage vehicle
  static async endUsageVehicle(id: number): Promise<Request> {
    return this.request<Request>(`/request/${id}/end-usage`, {
      method: 'PUT',
    });
  }

  static async remindVehicle(id: number): Promise<void> {
    return this.request<void>(`/request/${id}/remind-return`, {
      method: 'PUT',
    })
  }

  // Từ chối yêu cầu
  static async rejectRequest(id: number, reason: any): Promise<Request> {
    return this.request<Request>(`/request/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(reason),
    });
  }
}
