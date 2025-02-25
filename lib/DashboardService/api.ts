// services/dashboardApi.ts

import { DashboardData, RequestPerTime } from "@/types/dashboard";
import { TimeFrameParams } from "@/types/timeframe";

export class DashboardApiService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  static async get_dashboard_data(
    params: TimeFrameParams
  ): Promise<DashboardData> {
    try {
      let url = `${this.API_BASE_URL}/dashboard`;

      // Handle both days and custom date range
      if (params.from && params.to) {
        url += `?from=${params.from}&to=${params.to}`;
      } else if (params.days) {
        url += `?days=${params.days}`;
      }

      const RESPONSE = await fetch(url);
      if (!RESPONSE.ok) {
        throw new Error(`HTTP error! status: ${RESPONSE.status}`);
      }
      const DATA = await RESPONSE.json();
      return DATA;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  static async get_request_per_timeData(
    params: TimeFrameParams
  ): Promise<RequestPerTime[]> {
    try {
      const DATA = await this.get_dashboard_data(params);
      if (!Array.isArray(DATA.request_pertime)) {
        throw new Error("Invalid request_pertime data format");
      }
      return DATA.request_pertime.map((item) => ({
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

  static async get_Metrics(params: TimeFrameParams): Promise<{
    avg_cost: number;
    total_requests: number;
    avg_duration: number;
    avg_token: number;
    avg_completion_tokens: number;
    avg_prompt_tokens: number;
  }> {
    try {
      const DATA = await this.get_dashboard_data(params);
      return {
        avg_cost: DATA.avg_cost ?? 0,
        total_requests: DATA.total_requests ?? 0,
        avg_duration: DATA.avg_duration ?? 0,
        avg_token: DATA.avg_token ?? 0,
        avg_completion_tokens: DATA.avg_completion_tokens ?? 0,
        avg_prompt_tokens: DATA.avg_prompt_tokens ?? 0,
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  }
}
