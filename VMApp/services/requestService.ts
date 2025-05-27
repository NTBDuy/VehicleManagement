import { BaseApiClient } from './baseApiClient';
import Request from '../types/Request';
import Assignment from 'types/Assignment';

export class RequestService extends BaseApiClient {
  // Lấy tất cả requests
  static async getAllRequests(): Promise<Request[]> {
    return this.request<Request[]>('/request');
  }

  static async getAssignmentDetails(id: number): Promise<Assignment> {
    return this.request<Assignment>(`/request/${id}/assignment`)
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

  // Cancel request
  static async cancelRequest(id: number, reason: any): Promise<Request> {
    return this.request<Request>(`/request/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(reason),
    });
  }

  // Reject request
  static async rejectRequest(id: number, reason: any): Promise<Request> {
    return this.request<Request>(`/request/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(reason),
    });
  }
}
