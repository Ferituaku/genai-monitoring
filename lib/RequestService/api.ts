import { TraceFilters } from "@/types/requests";
import { TraceData } from "@/types/trace";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

export const fetchTraces = async (
  filters: TraceFilters
): Promise<TraceData[]> => {
  const queryParams = new URLSearchParams();
  // const baseUrl = filters.appName
  //   ? `${API_BASE_URL}/api/tracesRequest/${encodeURIComponent(filters.appName)}`
  //   : `${API_BASE_URL}/api/tracesRequest`;

  // Time frame parameters
  if (filters.timeFrame.from && filters.timeFrame.to) {
    queryParams.set("from", filters.timeFrame.from);
    queryParams.set("to", filters.timeFrame.to);
  } else if (filters.timeFrame.days) {
    queryParams.set("days", filters.timeFrame.days.toString());
  }

  if (filters.timeFrame.days) {
    queryParams.set("days", filters.timeFrame.days.toString());
  }

  // Token range
  if (filters.filters.tokenRange?.input?.min !== undefined) {
    queryParams.set(
      "min_input_tokens",
      filters.filters.tokenRange.input.min.toString()
    );
  }

  // Duration
  if (filters.filters.duration?.max !== undefined) {
    queryParams.set("max_duration", filters.filters.duration.max.toString());
  }

  // Stream
  if (filters.filters.isStream !== undefined) {
    queryParams.set("is_stream", filters.filters.isStream.toString());
  }

  // const addParam = (key: string, value: any) => {
  //   if (value !== undefined && value !== null) {
  //     queryParams.set(key, value.toString());
  //   }
  // };

  // Model filter
  if (filters.filters.models?.length) {
    queryParams.set("model", filters.filters.models[0]);
  }

  // Environment filter
  if (filters.filters.environments?.length) {
    queryParams.set("deployment_environment", filters.filters.environments[0]);
  }

  // Token range filters
  if (filters.filters.tokenRange) {
    const { input, output, total } = filters.filters.tokenRange;

    if (input) {
      if (input.min !== undefined)
        queryParams.set("min_input_tokens", input.min.toString());
      if (input.max !== undefined)
        queryParams.set("max_input_tokens", input.max.toString());
    }

    if (output) {
      if (output.min !== undefined)
        queryParams.set("min_output_tokens", output.min.toString());
      if (output.max !== undefined)
        queryParams.set("max_output_tokens", output.max.toString());
    }

    if (total) {
      if (total.min !== undefined)
        queryParams.set("min_total_tokens", total.min.toString());
      if (total.max !== undefined)
        queryParams.set("max_total_tokens", total.max.toString());
    }
  }

  // Duration filter
  if (filters.filters.duration) {
    if (filters.filters.duration.min !== undefined) {
      queryParams.set("min_duration", filters.filters.duration.min.toString());
    }
    if (filters.filters.duration.max !== undefined) {
      queryParams.set("max_duration", filters.filters.duration.max.toString());
    }
  }

  // Stream filter
  if (filters.filters.isStream !== undefined) {
    queryParams.set("is_stream", filters.filters.isStream.toString());
  }

  try {
    const url = `${API_BASE_URL}/api/tracesRequest?${queryParams}`;
    console.log("Fetching URL:", url); // Debugging

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching traces:", error);
    throw error instanceof Error ? error : new Error("Failed to fetch traces");
  }
};
