import { BaseApiClient } from './baseApiClient';
import Request from '../types/Request';

export class RequestService extends BaseApiClient {
  // Lấy tất cả requests
  static async getAllRequests(): Promise<Request[]> {
    return this.request<Request[]>('/requests');
  }

  // Tạo request mới
  static async createRequest(requestData: any): Promise<Request> {
    return this.request<Request>('/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Approve request 
  static async approveRequest(id: number, approvalData?: any): Promise<Request> {
    return this.request<Request>(`/request/${id}/approve`, {
      method: 'PUT',
      body: approvalData ? JSON.stringify(approvalData) : undefined,
    });
  }
}
