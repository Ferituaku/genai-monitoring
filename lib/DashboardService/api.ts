// services/dashboardApi.ts

export interface RequestPerTime {
  date: string;
  total_ok: number;
  total_error: number;
  total_unset: number;
}

interface RawRequestPerTime {
  date: string;
  total_count_ok: number;
  total_count_error: number;
  total_count_unset: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}
export interface DashboardData {
  request_pertime: RawRequestPerTime[];
  avg_cost: number;
  total_requests: number;
  avg_duration: number;
  avg_token: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export class DashboardApiService {
  static async getDashboardData(days: string | null): Promise<DashboardData> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard?days=${days}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  static async getRequestPerTimeData(
    days: string | null
  ): Promise<RequestPerTime[]> {
    try {
      const data = await this.getDashboardData(days);
      if (!Array.isArray(data.request_pertime)) {
        throw new Error("Invalid request_pertime data format");
      }
      return data.request_pertime.map((item) => ({
        date: item.date,
        total_ok: item.total_count_ok,
        total_error: item.total_count_error,
        total_unset: item.total_count_unset,
      }));
    } catch (error) {
      console.error("Error fetching request per time data:", error);
      throw error;
    }
  }

  static async getAverageCost(days: string | null): Promise<number> {
    try {
      if (!days) {
        return 0;
      }
      const data = await this.getDashboardData(days);
      return data?.avg_cost ?? 0;
    } catch (error) {
      console.error("Error fetching average cost data:", error);
      throw error;
    }
  }
  static async getTotalRequest(days: string | null): Promise<number> {
    try {
      if (!days) {
        return 0;
      }
      const data = await this.getDashboardData(days);
      return data.total_requests ?? 0;
    } catch (error) {
      console.error("Error fetching average cost data:", error);
      throw error;
    }
  }
  static async getAverageDuration(days: string | null): Promise<number> {
    try {
      if (!days) {
        return 0;
      }
      const data = await this.getDashboardData(days);
      return data.avg_duration ?? 0;
    } catch (error) {
      console.error("Error fetching average cost data:", error);
      throw error;
    }
  }
  static async getAverageToken(days: string | null): Promise<number> {
    try {
      if (!days) {
        return 0;
      }
      const data = await this.getDashboardData(days);
      return data.avg_token ?? 0;
    } catch (error) {
      console.error("Error fetching average cost data:", error);
      throw error;
    }
  }
}
