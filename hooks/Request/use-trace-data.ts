import { useState, useEffect, useCallback } from "react";
import { fetchTraces, PaginatedResponse } from "@/lib/RequestService/api";
import { Filters } from "@/types/requests";
import { TimeFrameParams } from "@/types/timeframe";
import { SortDirection, SortField, TraceData } from "@/types/trace";

// Interface for pagination
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseTraceDataParams {
  timeFrame: TimeFrameParams;
  sortField?: SortField;
  sortDirection?: SortDirection;
  filters: Filters;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export const useTraceData = ({
  timeFrame,
  sortField,
  sortDirection,
  filters,
  searchTerm = "",
  page = 1,
  pageSize = 10,
}: UseTraceDataParams) => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // Memoize fetch function
  const loadTraces = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetchTraces({
        timeFrame,
        filters,
        sortField,
        sortDirection,
        searchTerm,
        page,
        pageSize,
      });

      if (response && "data" in response && "pagination" in response) {
        const paginatedResponse = response as PaginatedResponse;
        setTraces(paginatedResponse.data);
        setPagination({
          total: paginatedResponse.pagination.total || 0,
          page: paginatedResponse.pagination.page || 1,
          pageSize: paginatedResponse.pagination.pageSize || 10,
          totalPages: paginatedResponse.pagination.totalPages || 1,
        });
      } else {
        const traceData = response as TraceData[];
        setTraces(traceData);
        // Count manual pagination
        const calculatedTotalPages = Math.ceil(traceData.length / pageSize);
        setPagination({
          total: traceData.length,
          page,
          pageSize,
          totalPages: calculatedTotalPages || 1,
        });
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTraces([]);
    } finally {
      setLoading(false);
    }
  }, [
    timeFrame.from,
    timeFrame.to,
    sortField,
    sortDirection,
    JSON.stringify(filters),
    searchTerm,
    page,
    pageSize,
  ]);

  useEffect(() => {
    loadTraces();
  }, [loadTraces]);

  return { traces, loading, error, pagination, refetch: loadTraces };
};
