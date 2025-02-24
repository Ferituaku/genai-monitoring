// hooks/Request/use-trace-data.ts
import { useState, useEffect, useCallback } from "react";
import { fetchTraces } from "@/lib/RequestService/api";
import { Filters } from "@/types/requests";
import { TimeFrameParams } from "@/types/timeframe";
import { TraceData } from "@/types/trace";

interface UseTraceDataParams {
  timeFrame: TimeFrameParams;
  sortField?: string;
  sortDirection?: string;
  filters: Filters;
  searchTerm?: string;
  pageSize?: string;
}

export const useTraceData = ({
  timeFrame,
  sortField,
  sortDirection,
  filters,
  searchTerm = "",
  pageSize = "50",
}: UseTraceDataParams) => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize fetch function
  const loadTraces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTraces({
        timeFrame,
        filters,
        sortField,
        sortDirection,
        searchTerm,
        pageSize,
      });
      setTraces(data);
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
    filters.models?.toString(),
    filters.environments?.toString(),
    filters.tokenRange?.input.min,
    filters.tokenRange?.input.max,
    filters.tokenRange?.output.min,
    filters.tokenRange?.output.max,
    filters.tokenRange?.total.min,
    filters.tokenRange?.total.max,
    filters.duration?.min,
    filters.duration?.max,
    filters.isStream,
    searchTerm,
    pageSize,
  ]);

  useEffect(() => {
    loadTraces();
  }, [loadTraces]);

  return { traces, loading, error };
};
