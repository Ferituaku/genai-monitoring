"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimeFrame from "@/components/TimeFrame";
import { useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { PageSizeSelector } from "@/components/request/PageSizeSelector";
import { SortSelector } from "@/components/request/SortSelector";
import { RequestTable } from "@/components/request/RequestTable";
import { FilterPanel } from "@/components/request/FilterPanel";
import { useTraceData } from "@/hooks/Request/useTraceData";
import { useFilteredTraces } from "@/hooks/Request/useFilteredTrace";
import { useSortedTraces } from "@/hooks/Request/useSortedTrace";
import { SortDirection, SortField, TraceData } from "@/types/trace";

const Request = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    []
  );
  const [sortField, setSortField] = useState<SortField>("Timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState("10");
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [environmentSearchTerm, setEnvironmentSearchTerm] = useState("");

  // Ambil data dari searchParams
  // const searchParams = useSearchParams();
  // const days = searchParams?.get("days") || "7";

  // Ambil data trace dari hook
  const { traces, loading, error } = useTraceData({
    selectedModels,
    selectedEnvironments,
    sortField,
    sortDirection,
  });

  // Filter traces berdasarkan searchTerm
  const filteredTraces = useFilteredTraces({
    traces,
    searchTerm,
    selectedModels,
    selectedEnvironments,
  });

  // Sort filtered traces
  const sortedTraces = useSortedTraces({
    filteredTraces,
    sortField,
    sortDirection,
  });

  // Batasi jumlah data yang ditampilkan
  const displayedTraces = sortedTraces.slice(0, parseInt(pageSize, 10));

  // Ambil model unik
  const uniqueModels = useMemo(
    () => [
      ...new Set(
        traces
          .map((trace) => trace.SpanAttributes["gen_ai.request.model"])
          .filter((model): model is string => model !== undefined)
      ),
    ],
    [traces]
  );

  // Ambil environment unik
  const uniqueEnvironments = useMemo(
    () => [
      ...new Set(
        traces
          .map((trace) => trace.ResourceAttributes["deployment.environment"])
          .filter((env): env is string => env !== undefined)
      ),
    ],
    [traces]
  );

  // Filter model berdasarkan pencarian
  const filteredUniqueModels = useMemo(
    () =>
      uniqueModels.filter((model) =>
        model.toLowerCase().includes(modelSearchTerm.toLowerCase())
      ),
    [uniqueModels, modelSearchTerm]
  );

  // Filter environment berdasarkan pencarian
  const filteredUniqueEnvironments = useMemo(
    () =>
      uniqueEnvironments.filter((env) =>
        env.toLowerCase().includes(environmentSearchTerm.toLowerCase())
      ),
    [uniqueEnvironments, environmentSearchTerm]
  );

  // Reset filters function
  const resetFilters = () => {
    setSelectedModels([]);
    setSelectedEnvironments([]);
    setSearchTerm("");
    setSortField("Timestamp");
    setSortDirection("desc");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>
      <div className="sticky right-0 z-10 top-2">
        <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex relative items-center gap-4">
              <TimeFrame />
            </div>
            <div className="relative flex min-w-[200px] items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari proyek"
                className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end items-center">
            {/* Page Size Button */}
            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
            {/* Sorting Button */}
            <SortSelector
              sortField={sortField}
              sortDirection={sortDirection}
              setSortField={setSortField}
              setSortDirection={setSortDirection}
            />
            {/* Filter Button */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="secondary"
                  className="border-gray-700 shadow-md bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4 text-white" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
                <FilterPanel
                  modelSearchTerm={modelSearchTerm}
                  setModelSearchTerm={setModelSearchTerm}
                  environmentSearchTerm={environmentSearchTerm}
                  setEnvironmentSearchTerm={setEnvironmentSearchTerm}
                  selectedModels={selectedModels}
                  setSelectedModels={setSelectedModels}
                  selectedEnvironments={selectedEnvironments}
                  setSelectedEnvironments={setSelectedEnvironments}
                  filteredUniqueModels={filteredUniqueModels}
                  filteredUniqueEnvironments={filteredUniqueEnvironments}
                  resetFilters={resetFilters}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
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
        ) : (
          <RequestTable displayedTraces={displayedTraces} />
        )}
      </div>
    </div>
  );
};

export default Request;
