"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { RequestTable } from "@/components/Request/RequestTable";
import { SortDirection, SortField } from "@/types/trace";
import { get_time_frame_params } from "@/hooks/TimeFrame/api";
import { useTraceData } from "@/hooks/Request/use-trace-data";
import { RequestControls } from "@/components/Request/RequestControl";
import { useFilterOptions } from "@/hooks/Request/use-filter-options";

export default function Request() {
  // Basic states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pageSize, setPageSize] = useState("10");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("Timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter states
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [environmentSearchTerm, setEnvironmentSearchTerm] = useState("");

  // Get filter options from API
  const { 
    availableModels, 
    availableEnvironments, 
    loading: loadingFilters 
  } = useFilterOptions();

  // Get time frame from URL params
  const searchParams = useSearchParams();
  const timeFrame = get_time_frame_params(searchParams);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  }, [searchTerm]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Fetch data dengan paginasi
  const { traces, loading, error, pagination } = useTraceData({
    timeFrame,
    sortField,
    sortDirection,
    filters: {
      models: selectedModels,
      environments: selectedEnvironments,
    },
    searchTerm: activeSearchTerm,
    page: currentPage,
    pageSize: parseInt(pageSize, 10),
  });

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    setIsFiltersApplied(true);
    setIsFilterOpen(false);
    setCurrentPage(1);
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSelectedModels([]);
    setSelectedEnvironments([]);
    setSearchTerm("");
    setSortField("Timestamp");
    setSortDirection("desc");
    setIsFiltersApplied(false);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to first page when filters are reset
  }, []);

  // Reset currentPage
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Filter models based on search term
  const filteredUniqueModels = useMemo(
    () =>
      availableModels.filter((model) =>
        model.toLowerCase().includes(modelSearchTerm.toLowerCase())
      ),
    [availableModels, modelSearchTerm]
  );

  // Filter environments based on search term
  const filteredUniqueEnvironments = useMemo(
    () =>
      availableEnvironments.filter((env) =>
        env.toLowerCase().includes(environmentSearchTerm.toLowerCase())
      ),
    [availableEnvironments, environmentSearchTerm]
  );

  // Handler page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  console.log("Pagination data:", {
    currentPage,
    totalPages: pagination?.totalPages,
    totalItems: pagination?.total,
    pageSize: parseInt(pageSize, 10),
    tracesLength: traces.length,
  });

  return (
    <div className="h-full overflow-visible">
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
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          onApplyFilters={handleApplyFilters}
          resetFilters={handleResetFilters}
          filteredUniqueModels={filteredUniqueModels}
          filteredUniqueEnvironments={filteredUniqueEnvironments}
          handleSearch={handleSearch}
          handleKeyPress={handleKeyPress}
          isSearching={isSearching}
          timeFrame={timeFrame}
          displayedTraces={traces}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          filters={{
            models: selectedModels,
            environments: selectedEnvironments
          }}
          isLoadingFilters={loadingFilters}
        />
      </div>

      <div className="sticky top-20 bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex min-h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : traces.length === 0 ? (
          <div className="flex bg-white bg-opacity-0 min-h-96  items-center justify-center text-gray-500">
            No data found
          </div>
        ) : (
          <div>
            <RequestTable
              displayedTraces={traces}
              currentPage={currentPage}
              totalPages={Math.max(1, pagination?.totalPages || 1)}
              onPageChange={handlePageChange}
              totalItems={pagination?.total || traces.length}
              pageSize={parseInt(pageSize, 10)}
            />
          </div>
        )}
      </div>
    </div>
  );
}