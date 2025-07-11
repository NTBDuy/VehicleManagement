import { BaseApiClient } from 'services/baseApiClient';

import Request from '@/types/Request';
import { DailyData, UserUsageData, VehicleUsageData } from '@/types/Statistic';

export class StatisticService extends BaseApiClient {
  static async getRequestStatistic(
    startDate: string,
    endDate: string,
    status?: number
  ): Promise<Request[]> {
    return this.request<Request[]>(
      `/statistic/request?startDate=${startDate}&endDate=${endDate}${status !== undefined ? `&status=${status}` : ''}`
    );
  }

  static async getStatVehicleMostUsage(
    startDate: string,
    endDate: string,
    status?: number
  ): Promise<VehicleUsageData[]> {
    return this.request<VehicleUsageData[]>(
      `/statistic/vehicle-most-usage?startDate=${startDate}&endDate=${endDate}${status !== undefined ? `&status=${status}` : ''}`
    );
  }

  static async getStatVehicleMostUsageAllTime(): Promise<VehicleUsageData[]> {
    return this.request<VehicleUsageData[]>(`/statistic/vehicle-usage`);
  }

  static async getStatRequestPerDay(
    startDate: string,
    endDate: string,
    status?: number
  ): Promise<DailyData[]> {
    return this.request<DailyData[]>(
      `/statistic/request-per-day?startDate=${startDate}&endDate=${endDate}${status !== undefined ? `&status=${status}` : ''}`
    );
  }

  static async getStatUserMostUsage(
    startDate: string,
    endDate: string,
    status?: number
  ): Promise<UserUsageData[]> {
    return this.request<UserUsageData[]>(
      `/statistic/user-most-request?startDate=${startDate}&endDate=${endDate}${status !== undefined ? `&status=${status}` : ''}`
    );
  }
}
