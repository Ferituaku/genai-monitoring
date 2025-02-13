// services/dashboardApi.ts

import { TimeFrameParams } from "@/types/timeframe";
import { createTimeFrameQueryString } from "../TimeFrame/api";

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
  avg_completion_tokens: number;
  avg_prompt_tokens: number;
  token_usage: number;
  "Cost by app": Record<string, any>;
  "Gen by category": Record<string, any>;
  "Cost by env": Record<string, any>;
  "Top Model": Record<string, any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export class DashboardApiService {
  static async getDashboardData(
    params: TimeFrameParams
  ): Promise<DashboardData> {
    try {
      let url = `${API_BASE_URL}/dashboard`;

      // Handle both days and custom date range
      if (params.from && params.to) {
        url += `?from=${params.from}&to=${params.to}`;
      } else if (params.days) {
        url += `?days=${params.days}`;
      }

      const response = await fetch(url);
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
    params: TimeFrameParams
  ): Promise<RequestPerTime[]> {
    try {
      const data = await this.getDashboardData(params);
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

  static async getMetrics(params: TimeFrameParams): Promise<{
    avg_cost: number;
    total_requests: number;
    avg_duration: number;
    avg_token: number;
    avg_completion_tokens: number;
    avg_prompt_tokens: number;
  }> {
    try {
      const data = await this.getDashboardData(params);
      return {
        avg_cost: data.avg_cost ?? 0,
        total_requests: data.total_requests ?? 0,
        avg_duration: data.avg_duration ?? 0,
        avg_token: data.avg_token ?? 0,
        avg_completion_tokens: data.avg_completion_tokens ?? 0,
        avg_prompt_tokens: data.avg_prompt_tokens ?? 0,
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  }
}
