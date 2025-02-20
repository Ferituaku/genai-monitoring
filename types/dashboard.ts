export interface RequestPerTime {
  date: string;
  total_ok: number;
  total_error: number;
  total_unset: number;
}

export interface RawRequestPerTime {
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
