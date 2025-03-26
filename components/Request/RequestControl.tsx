// components/Request/RequestControl.tsx
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SortField, SortDirection, TraceData } from "@/types/trace";
import { SortSelector } from "./SortSelector";
import { PageSizeSelector } from "./PageSizeSelector";
import { FilterPanel } from "./FilterPanel";
import TimeFrame from "../TimeFrame/TimeFrame";
import { Filters, TokenRange } from "@/types/requests";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Button } from "../ui/button";
import { ExportButton } from "./ExportButton";
import { TimeFrameParams } from "@/types/timeframe";

interface RequestControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pageSize: string;
  setPageSize: (size: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  selectedEnvironments: string[];
  setSelectedEnvironments: (environments: string[]) => void;
  modelSearchTerm: string;
  setModelSearchTerm: (term: string) => void;
  environmentSearchTerm: string;
  setEnvironmentSearchTerm: (term: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  onApplyFilters: () => void;
  resetFilters: () => void;
  filteredUniqueModels: string[];
  filteredUniqueEnvironments: string[];
  handleSearch: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isSearching: boolean;
  timeFrame: TimeFrameParams;
  displayedTraces?: TraceData[];
  isExporting?: boolean;
  setIsExporting?: (isExporting: boolean) => void;
  filters: Filters;
  isLoadingFilters?: boolean;
}

export const RequestControls: React.FC<RequestControlsProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleKeyPress,
  isSearching,
  pageSize,
  setPageSize,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  selectedModels,
  setSelectedModels,
  selectedEnvironments,
  setSelectedEnvironments,
  modelSearchTerm,
  setModelSearchTerm,
  environmentSearchTerm,
  setEnvironmentSearchTerm,
  isFilterOpen,
  setIsFilterOpen,
  onApplyFilters,
  resetFilters,
  filteredUniqueModels,
  filteredUniqueEnvironments,
  timeFrame,
  displayedTraces,
  isExporting = false,
  setIsExporting = () => {},
  filters,
  isLoadingFilters = false
}) => {
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
            placeholder="Search service"
            className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={handleKeyPress}
          />
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>
      <div className="flex gap-2 justify-end items-center">
        <ExportButton
          timeFrame={timeFrame}
          filters={filters}
          sortField={sortField}
          sortDirection={sortDirection}
          searchTerm={searchTerm}
          traces={displayedTraces}
          onExportStart={() => setIsExporting(true)}
          onExportComplete={() => setIsExporting(false)}
          isDisabled={
            isExporting || isSearching || displayedTraces?.length === 0
          }
        />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
        <SortSelector
          sortField={sortField}
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
        />
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
            {isLoadingFilters ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Loading filter options...</span>
              </div>
            ) : (
              <FilterPanel
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                selectedEnvironments={selectedEnvironments}
                setSelectedEnvironments={setSelectedEnvironments}
                modelSearchTerm={modelSearchTerm}
                setModelSearchTerm={setModelSearchTerm}
                environmentSearchTerm={environmentSearchTerm}
                setEnvironmentSearchTerm={setEnvironmentSearchTerm}
                resetFilters={resetFilters}
                onApply={onApplyFilters}
                filteredUniqueModels={filteredUniqueModels}
                filteredUniqueEnvironments={filteredUniqueEnvironments}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};