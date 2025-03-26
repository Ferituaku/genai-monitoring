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

interface ExtendedTraceData extends TraceData {
  Events?: {
    Attributes?: Array<{
      "gen_ai.prompt"?: string;
      "gen_ai.completion"?: string;
      [key: string]: string | undefined;
    }>;
    Name?: string[];
    Timestamp?: string[];
  };
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

    // Add time frame parameters with optional checks
    if (timeFrame?.from) {
      queryParams.append("from", new Date(timeFrame.from).toISOString());
    }
    if (timeFrame?.to) {
      queryParams.append("to", new Date(timeFrame.to).toISOString());
    }

    // Pagination with configurable size
    queryParams.append("page", "1");
    queryParams.append("page_size", "5000"); // Increased limit for more comprehensive export

    // Flexible search term handling
    if (searchTerm) {
      queryParams.append("search", searchTerm); // More generic search parameter
    }

    // Robust model filtering
    if (filters.models?.length) {
      filters.models.forEach((model) => queryParams.append("model", model));
    }

    // Robust environment filtering
    if (filters.environments?.length) {
      filters.environments.forEach((env) =>
        queryParams.append("deployment_environment", env)
      );
    }

    // Sorting parameters
    queryParams.append("sortBy", sortField);
    queryParams.append("sortOrder", sortDirection);

    // Export flag
    queryParams.append("export", "true");

    // Enhanced fetch with error handling
    const response = await fetch(
      `${BASE_URL}/api/tracesRequest/export?${queryParams}`,
      { 
        method: "GET",
        headers: {
          'Accept': 'text/csv',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${response.status} - ${errorText}`);
    }

    // Download the CSV with improved naming
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const defaultFileName = `trace-export-${timestamp}.csv`;
    
    a.href = url;
    a.download = defaultFileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Comprehensive error in data export:", error);
    throw error;
  }
};

export const generateCSVFromTraces = (traces: TraceData[]): string => {
  if (!traces || traces.length === 0) {
    return "No data available";
  }

  // Comprehensive headers
  const headers = [
    "Timestamp",
    "Service Name", 
    "Model", 
    "Environment",
    "Prompt Tokens", 
    "Completion Tokens",  
    "Total Tokens", 
    "Cost",
    "Status Code",
    "Prompt", 
    "Completion"
  ];

  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return "";

    const stringValue = String(value).trim();

    // Enhanced CSV escaping
    if (/[",\n\r]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // More robust row generation
  const rows = traces.map((trace) => {
    const getAttributeValue = (attribute: string, defaultValue = "") =>
      trace.SpanAttributes[attribute] || defaultValue;

    // Improved token and status code handling with explicit fallbacks
    const completionTokens = getAttributeValue("gen_ai.usage.output_tokens", "0");
    const promptTokens = getAttributeValue("gen_ai.usage.input_tokens", "0");
    const totalTokens = getAttributeValue("gen_ai.usage.total_tokens", "0");
    const cost = getAttributeValue("gen_ai.usage.cost", "0");
    const statusCode = getAttributeValue("http.status_code", "N/A");

    const { prompt, completion } = getPromptAndCompletion(trace);

    return [
      escapeCSV(trace.Timestamp ? new Date(trace.Timestamp).toLocaleString() : ""),
      escapeCSV(trace.ServiceName),
      escapeCSV(getAttributeValue("gen_ai.request.model")),
      escapeCSV(trace.ResourceAttributes?.["deployment.environment"] || ""),
      escapeCSV(promptTokens),
      escapeCSV(completionTokens),
      escapeCSV(totalTokens),
      escapeCSV(cost),
      escapeCSV(statusCode),
      escapeCSV(prompt),
      escapeCSV(completion)
    ].join(",");
  });

  // Combine headers and rows with BOM for Excel compatibility
  return ["\uFEFF" + headers.map(escapeCSV).join(","), ...rows].join("\n");
};

export const downloadCSV = (csvContent: string, filename?: string): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultFilename = `traces-export-${timestamp}.csv`;

  // Create blob with proper MIME type and UTF-8 encoding
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename || defaultFilename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Improved cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Enhanced helper function to extract prompt and completion
const getPromptAndCompletion = (
  data: ExtendedTraceData
): { prompt: string; completion: string } => {
  let prompt = "";
  let completion = "";

  const extractFromAttributes = (
    attrs?: Array<{ [key: string]: string | undefined }>
  ) => {
    if (!attrs) return { prompt: "", completion: "" };

    const promptAttr = attrs.find((attr) => attr["gen_ai.prompt"]);
    const completionAttr = attrs.find((attr) => attr["gen_ai.completion"]);

    return {
      prompt: promptAttr?.["gen_ai.prompt"] || "",
      completion: completionAttr?.["gen_ai.completion"] || "",
    };
  };

  // Multiple fallback mechanisms
  const extractionMethods = [
    () => extractFromAttributes(data["Events.Attributes"]),
    () => extractFromAttributes(data.Events?.Attributes),
    () => ({
      prompt: data.SpanAttributes?.["gen_ai.prompt"] || "",
      completion: data.SpanAttributes?.["gen_ai.completion"] || "",
    }),
  ];

  for (const method of extractionMethods) {
    const result = method();
    if (result.prompt || result.completion) {
      prompt = result.prompt;
      completion = result.completion;
      break;
    }
  }

  return { 
    prompt: prompt.trim(), 
    completion: completion.trim() 
  };
};