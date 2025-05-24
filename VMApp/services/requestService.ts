import { BaseApiClient } from './baseApiClient';
import Request from '../types/Request';

export class RequestService extends BaseApiClient {
  // Tạo request mới
  static async createRequest(requestData: any): Promise<Request> {
    return this.request<Request>('/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
}
