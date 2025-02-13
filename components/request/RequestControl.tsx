import { Search, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import TimeFrame from "@/components/TimeFrame";
import { SortField, SortDirection, TraceData } from "@/types/trace";
import { FilterButton } from "./RequestFilter";
import { SortSelector } from "./SortSelector";
import { useMemo, useState } from "react";
import { PageSizeSelector } from "@/components/request/PageSizeSelector";

interface RequestControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pageSize: string;
  setPageSize: (size: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  setIsFilterOpen: (open: boolean) => void;
}

const [searchTerm, setSearchTerm] = useState("");
const [pageSize, setPageSize] = useState("10");
const [isFilterOpen, setIsFilterOpen] = useState(false);

//  advanced filtering and sorting
const [selectedModels, setSelectedModels] = useState<string[]>([]);
const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
const [sortField, setSortField] = useState<string>("Timestamp");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

//  searchable filters
const [modelSearchTerm, setModelSearchTerm] = useState("");
const [environmentSearchTerm, setEnvironmentSearchTerm] = useState("");

const [traces, setTraces] = useState<TraceData[]>([]);

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

// Reset filters function
const resetFilters = () => {
  setSelectedModels([]);
  setSelectedEnvironments([]);
  setSearchTerm("");
  setSortField("Timestamp");
  setSortDirection("desc");
};

export const RequestControls = ({
  searchTerm,
  setSearchTerm,
  pageSize,
  setPageSize,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  setIsFilterOpen,
}: RequestControlsProps) => {
  return (
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
        <FilterButton
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
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
      </div>
    </div>
  );
};
