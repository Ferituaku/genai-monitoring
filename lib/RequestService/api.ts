import { Filters } from "@/types/requests";
import { TimeFrameParams } from "@/types/timeframe";
import { SortDirection, SortField, TraceData } from "@/types/trace";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101";

// Interface untuk pagination
export interface PaginatedResponse {
  data: TraceData[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Interface untuk filter options
export interface FilterOptionsResponse {
  models: string[];
  environments: string[];
}

interface FetchTracesParams {
  timeFrame: TimeFrameParams;
  filters: Filters;
  sortField?: SortField;
  sortDirection?: SortDirection;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export const fetchTraces = async ({
  timeFrame,
  filters,
  sortField = "Timestamp",
  sortDirection = "desc",
  searchTerm,
  page = 1,
  pageSize = 10,
}: FetchTracesParams): Promise<PaginatedResponse | TraceData[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (timeFrame?.from) {
      const fromDate = new Date(timeFrame.from).toISOString();
      queryParams.append("from", fromDate);
    }
    if (timeFrame?.to) {
      const toDate = new Date(timeFrame.to).toISOString();
      queryParams.append("to", toDate);
    }
    // Pagination params
    queryParams.append("page", page.toString());
    queryParams.append("page_size", pageSize.toString());
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
    console.log(
      `Setting sort params: sortBy=${sortField}, sortOrder=${sortDirection}`
    );
    queryParams.append("sortBy", sortField);
    queryParams.append("sortOrder", sortDirection);
    
    const response = await fetch(
      `${BASE_URL}/api/tracesRequest/?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.data && data.pagination) {
      return data as PaginatedResponse;
    } else if (Array.isArray(data)) {
      return {
        data: data,
        pagination: {
          total: data.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.max(1, Math.ceil(data.length / pageSize)),
        },
      } as PaginatedResponse;
    } else {
      const dataArray = Array.isArray(data) ? data : data.data || [];
      return {
        data: dataArray,
        pagination: {
          total: dataArray.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.max(1, Math.ceil(dataArray.length / pageSize)),
        },
      } as PaginatedResponse;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/filterOptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as FilterOptionsResponse;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    // Return empty arrays as default if there's an error
    return {
      models: [],
      environments: []
    };
  }
};