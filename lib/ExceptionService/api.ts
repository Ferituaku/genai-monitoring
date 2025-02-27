import { TimeFrameParams } from "@/types/timeframe";

export class ExceptionApiService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  static async get_exception_trace(
    params: TimeFrameParams,
    searchQuery?: string
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
        queryParams.append("appName", searchQuery);
      }

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
