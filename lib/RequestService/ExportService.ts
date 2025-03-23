// lib/RequestService/exportService.ts
import { Filters } from "@/types/requests";
import { TimeFrameParams } from "@/types/timeframe";
import { SortDirection, SortField, TraceData } from "@/types/trace";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101";

interface ExportTracesParams {
  timeFrame: TimeFrameParams;
  filters: Filters;
  sortField?: SortField;
  sortDirection?: SortDirection;
  searchTerm?: string;
}

export const exportTracesToCSV = async ({
  timeFrame,
  filters,
  sortField = "Timestamp",
  sortDirection = "desc",
  searchTerm,
}: ExportTracesParams): Promise<void> => {
  try {
    const queryParams = new URLSearchParams();

    // ambil parameter yang sama dari timeframe parameters
    if (timeFrame?.from) {
      const fromDate = new Date(timeFrame.from).toISOString();
      queryParams.append("from", fromDate);
    }
    if (timeFrame?.to) {
      const toDate = new Date(timeFrame.to).toISOString();
      queryParams.append("to", toDate);
    }

    // ini sebernaernya untuk limit pagination tapi sementara sesuaiin sama yang page yg dishow
    queryParams.append("page", "1");
    queryParams.append("page_size", "1000"); // Get a large number of records

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

    // Add sorting parameters
    queryParams.append("sortBy", sortField);
    queryParams.append("sortOrder", sortDirection);

    // Add export flag
    queryParams.append("export", "true");

    // Fetch the CSV data
    const response = await fetch(
      `${BASE_URL}/api/tracesRequest/export?${queryParams}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the blob from the response
    const blob = await response.blob();

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `trace-requests-export-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
};

// Alternative method if you want to generate CSV on frontend
export const generateCSVFromTraces = (traces: TraceData[]): string => {
  if (!traces || traces.length === 0) {
    return "No data available";
  }

  // Define the headers for your CSV
  const headers = [
    "Timestamp",
    "Service Name",
    "Model",
    "Environment",
    "Token Completion",
    "Token Prompt",
    "Total Token",
    "Cost",
    "Prompt",
    "Completion",
  ];

  const escapeCSV = (value: string) => {
    // If value contains commas, quotes, or newlines, wrap it in quotes
    if (/[",\n\r]/.test(value)) {
      // Double up any quotes within the value
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Create CSV rows from the trace data
  const rows = traces.map((trace) => {
    const timestamp = trace.Timestamp
      ? new Date(trace.Timestamp).toLocaleString()
      : "";
    const serviceName = trace.ServiceName || "";
    const model = trace.SpanAttributes["gen_ai.request.model"] || "";
    const environment =
      trace.ResourceAttributes["deployment.environment"] || "";
    const completionTokens =
      trace.SpanAttributes["gen_ai.usage.completion_tokens"] || "0";
    const promptTokens =
      trace.SpanAttributes["gen_ai.usage.prompt_tokens"] || "0";
    const totalTokens =
      trace.SpanAttributes["gen_ai.usage.total_tokens"] || "0";
    const cost = trace.SpanAttributes["gen_ai.usage.cost"] || "0";
   
    return [
      escapeCSV(timestamp),
      escapeCSV(serviceName),
      escapeCSV(model),
      escapeCSV(environment),
      escapeCSV(completionTokens),
      escapeCSV(promptTokens),
      escapeCSV(totalTokens),
      escapeCSV(cost),
      escapeCSV(prompt),
      escapeCSV(completion),
    ].join(",");
  });

  // Combine headers and rows
  return [headers.map(escapeCSV).join(","), ...rows].join("\n");
};

// export const downloadCSV = (csvContent: string, filename: string): void => {
//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");

//   link.setAttribute("href", url);
//   link.setAttribute("download", filename);
//   link.style.visibility = "hidden";

//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

export const downloadCSV = (csvContent: string, filename: string): void => {
  // Add BOM (Byte Order Mark) for Excel to correctly recognize UTF-8
  const BOM = "\uFEFF";
  const csvContentWithBOM = BOM + csvContent;

  // Create blob with proper MIME type for Excel
  const blob = new Blob([csvContentWithBOM], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};
