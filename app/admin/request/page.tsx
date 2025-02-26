"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { RequestTable } from "@/components/Request/RequestTable";
import { SortDirection, SortField, TraceData } from "@/types/trace";
import { get_time_frame_params } from "@/hooks/TimeFrame/api";
import { TokenRange } from "@/types/requests";
import { useTraceData } from "@/hooks/Request/use-trace-data";
import { RequestControls } from "@/components/Request/RequestControl";

export default function Request() {
  // Basic states
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("Timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter states
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    []
  );
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [environmentSearchTerm, setEnvironmentSearchTerm] = useState("");
  const [tokenRange, setTokenRange] = useState<{
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  }>({
    input: { min: 0, max: 4000 },
    output: { min: 0, max: 4000 },
    total: { min: 0, max: 8000 },
  });
  const [duration, setDuration] = useState({ min: 0, max: 10000 });
  const [isStream, setIsStream] = useState(false);

  // Get time frame from URL params
  const searchParams = useSearchParams();
  const timeFrame = get_time_frame_params(searchParams);

  // Fetch data
  const { traces, loading, error } = useTraceData({
    timeFrame,
    sortField,
    sortDirection,
    filters: {
      models: selectedModels,
      environments: selectedEnvironments,
      tokenRange,
      duration,
      isStream,
    },
    searchTerm,
  });

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    setIsFiltersApplied(true);
    setIsFilterOpen(false);
  }, []);
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSelectedModels([]);
    setSelectedEnvironments([]);
    setSearchTerm("");
    setSortField("Timestamp");
    setSortDirection("desc");
    setTokenRange({
      input: { min: 0, max: 4000 },
      output: { min: 0, max: 4000 },
      total: { min: 0, max: 8000 },
    });
    setDuration({ min: 0, max: 10000 });
    setIsStream(false);
    setIsFiltersApplied(true); // Trigger refetch after reset
    setIsFilterOpen(false);
  }, []);

  // Get unique models and environments for filters
  const uniqueModels = useMemo(
    () => [
      ...new Set(
        traces
          .map((trace) => trace.SpanAttributes["gen_ai.request.model"])
          .filter(Boolean)
      ),
    ],
    [traces]
  );

  const uniqueEnvironments = useMemo(
    () => [
      ...new Set(
        traces
          .map((trace) => trace.ResourceAttributes["deployment.environment"])
          .filter(Boolean)
      ),
    ],
    [traces]
  );

  // Filter models and environments based on search
  const filteredUniqueModels = useMemo(
    () =>
      uniqueModels.filter((model) =>
        model.toLowerCase().includes(modelSearchTerm.toLowerCase())
      ),
    [uniqueModels, modelSearchTerm]
  );

  const filteredUniqueEnvironments = useMemo(
    () =>
      uniqueEnvironments.filter((env) =>
        env.toLowerCase().includes(environmentSearchTerm.toLowerCase())
      ),
    [uniqueEnvironments, environmentSearchTerm]
  );

  // Limit traces based on page size
  const displayedTraces = useMemo(() => {
    const startIndex = 0;
    const endIndex = parseInt(pageSize, 10);
    return traces.slice(startIndex, endIndex);
  }, [traces, pageSize]);

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <div className="fixed top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>
      <div className="sticky right-0 z-10 top-2">
        <RequestControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pageSize={pageSize}
          setPageSize={setPageSize}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          selectedModels={selectedModels}
          setSelectedModels={setSelectedModels}
          selectedEnvironments={selectedEnvironments}
          setSelectedEnvironments={setSelectedEnvironments}
          modelSearchTerm={modelSearchTerm}
          setModelSearchTerm={setModelSearchTerm}
          environmentSearchTerm={environmentSearchTerm}
          setEnvironmentSearchTerm={setEnvironmentSearchTerm}
          tokenRange={tokenRange}
          setTokenRange={setTokenRange}
          duration={duration}
          setDuration={setDuration}
          isStream={isStream}
          setIsStream={setIsStream}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onApplyFilters={handleApplyFilters}
          resetFilters={handleResetFilters}
          filteredUniqueModels={filteredUniqueModels}
          filteredUniqueEnvironments={filteredUniqueEnvironments}
        />
      </div>

      <div className="sticky top-20 bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : displayedTraces.length === 0 ? (
          <div className="flex h-screen items-center justify-center text-gray-500">
            No data found
          </div>
        ) : (
          <RequestTable displayedTraces={displayedTraces} />
        )}
      </div>
    </div>
  );
}
