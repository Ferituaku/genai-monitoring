// request/api.ts

import { TraceFilters } from "@/types/requests";
import { TraceData } from "@/types/trace";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export const fetchTraces = async ({
  timeFrame,
  filters,
}: TraceFilters): Promise<TraceData[]> => {
  const queryParams = new URLSearchParams();

  // Time frame params
  if (timeFrame.from && timeFrame.to) {
    queryParams.set("from", timeFrame.from);
    queryParams.set("to", timeFrame.to);
  } else if (timeFrame.days) {
    queryParams.set("days", timeFrame.days);
  }

  // Filter params
  if (filters.environments?.length) {
    queryParams.set("deployment_environment", filters.environments.join(","));
  }
  if (filters.system) {
    queryParams.set("system", filters.system);
  }
  if (filters.models) {
    queryParams.set("model", filters.models);
  }
  if (filters.operationName) {
    queryParams.set("operation_name", filters.operationName);
  }
  if (filters.endpoint) {
    queryParams.set("endpoint", filters.endpoint);
  }
  if (filters.tokenRange?.input?.min !== undefined) {
    queryParams.set(
      "min_input_tokens",
      filters.tokenRange.input.min.toString()
    );
  }
  if (filters.tokenRange?.input?.max !== undefined) {
    queryParams.set(
      "max_input_tokens",
      filters.tokenRange.input.max.toString()
    );
  }
  if (filters.tokenRange?.output?.min !== undefined) {
    queryParams.set(
      "min_output_tokens",
      filters.tokenRange.output.min.toString()
    );
  }
  if (filters.tokenRange?.output?.max !== undefined) {
    queryParams.set(
      "max_output_tokens",
      filters.tokenRange.output.max.toString()
    );
  }
  if (filters.tokenRange?.total?.min !== undefined) {
    queryParams.set(
      "min_total_tokens",
      filters.tokenRange.total.min.toString()
    );
  }
  if (filters.tokenRange?.total?.max !== undefined) {
    queryParams.set(
      "max_total_tokens",
      filters.tokenRange.total.max.toString()
    );
  }
  if (filters.duration?.min !== undefined) {
    queryParams.set("min_duration", filters.duration.min.toString());
  }
  if (filters.duration?.max !== undefined) {
    queryParams.set("max_duration", filters.duration.max.toString());
  }
  if (filters.isStream !== undefined) {
    queryParams.set("is_stream", filters.isStream.toString());
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tracesRequest/?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch traces"
    );
  }
};
