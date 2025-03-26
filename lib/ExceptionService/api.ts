import { TimeFrameParams } from "@/types/timeframe";
import { SortDirection, SortField } from "@/types/trace";

export class ExceptionApiService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  static async get_exception_trace(
    params: TimeFrameParams,
    searchQuery?: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: SortField = "Timestamp",
    sortDirection: SortDirection = "desc"
  ) {
    try {
      const queryParams = new URLSearchParams();

      if (params?.from) {
        queryParams.append("from", params.from);
      }

      if (params?.to) {
        queryParams.append("to", params.to);
      }

      if (searchQuery) {
        queryParams.append("app_name", searchQuery);
      }

      // Add pagination parameters
      queryParams.append("page", page.toString());
      queryParams.append("page_size", pageSize.toString());

      queryParams.append("sort_field", sortField);
      queryParams.append("sort_direction", sortDirection);

      const url = `${this.API_BASE_URL}/api/tracesExceptions${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        credentials: "same-origin",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching exception traces:", error);
      throw error;
    }
  }
}
