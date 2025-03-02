// api.ts
import { Filters } from "@/types/requests";
import { TimeFrameParams } from "@/types/timeframe";
import { TraceData } from "@/types/trace";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101";

interface UseTraceDataParams {
  timeFrame: TimeFrameParams;
  filters: Filters;
  sortField?: string;
  sortDirection?: string;
  searchTerm?: string;
}

export const fetchTraces = async ({
  timeFrame,
  filters,
  sortField,
  sortDirection,
  searchTerm,
}: UseTraceDataParams): Promise<TraceData[]> => {
  try {
    const queryParams = new URLSearchParams();

    // if (timeFrame?.from) {
    //   const fromDate = new Date(timeFrame.from);
    //   // Pastikan timezone
    //   fromDate.setUTCHours(0, 0, 0, 0);
    //   queryParams.append("from", fromDate.toISOString());
    // }
    // if (timeFrame?.to) {
    //   const toDate = new Date(timeFrame.to);
    //   // Pastikan timezone
    //   toDate.setUTCHours(23, 59, 59, 999);
    //   queryParams.append("to", toDate.toISOString());
    // }

    if (timeFrame?.from) {
      const fromDate = new Date(timeFrame.from).toISOString();
      queryParams.append("from", fromDate);
    }
    if (timeFrame?.to) {
      const toDate = new Date(timeFrame.to).toISOString();
      queryParams.append("to", toDate);
    }

    // if (timeFrame?.from) queryParams.append("from", timeFrame.from);
    // if (timeFrame?.to) queryParams.append("to", timeFrame.to);

    if (searchTerm) {
      queryParams.append("app_name", searchTerm);
    }

    if (filters.models && filters.models.length > 0) {
      filters.models.forEach((model: string) => {
        queryParams.append("model", model); 
      });
    }

    if (filters.environments && filters.environments.length > 0) {
      filters.environments.forEach((env: string) => {
        queryParams.append("deployment_environment", env);
      });
    }
    // if (filters.tokenRange?.input) {
    //   queryParams.append(
    //     "minInputTokens",
    //     filters.tokenRange.input.min.toString()
    //   );
    //   queryParams.append(
    //     "maxInputTokens",
    //     filters.tokenRange.input.max.toString()
    //   );
    // }

    // if (filters.tokenRange?.output) {
    //   queryParams.append(
    //     "minOutputTokens",
    //     filters.tokenRange.output.min.toString()
    //   );
    //   queryParams.append(
    //     "maxOutputTokens",
    //     filters.tokenRange.output.max.toString()
    //   );
    // }

    // if (filters.tokenRange?.total) {
    //   queryParams.append(
    //     "minTotalTokens",
    //     filters.tokenRange.total.min.toString()
    //   );
    //   queryParams.append(
    //     "maxTotalTokens",
    //     filters.tokenRange.total.max.toString()
    //   );
    // }

    // if (filters.duration) {
    //   queryParams.append("min_duration", filters.duration.min.toString());
    //   queryParams.append("min_duration", filters.duration.max.toString());
    // }

    // if (filters.isStream !== undefined) {
    //   queryParams.append("isStream", filters.isStream.toString());
    // }

    // Add sorting
    if (sortField) queryParams.append("sortBy", sortField);
    if (sortDirection) queryParams.append("sortOrder", sortDirection);

    console.log(
      "Fetching with URL:",
      `${BASE_URL}/api/tracesRequest/?${queryParams}`
    ); // Debug log

    const response = await fetch(
      `${BASE_URL}/api/tracesRequest/?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Tambahkan header untuk menangani CORS jika diperlukan
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching traces:", error);
    throw error;
  }
};
