// Types
interface TimeFrameParams {
  days?: string;
  from?: string;
  to?: string;
}

export class ExceptionApiService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  static async get_exception_trace(params: TimeFrameParams) {
    try {
      let url = `${this.API_BASE_URL}/api/tracesExceptions`;

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
      console.error("Error fetching exception traces:", error);
      throw error;
    }
  }
}
