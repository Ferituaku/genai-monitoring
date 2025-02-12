import { SortDirection, SortField, TraceData } from "./trace";

export interface UseTraceDataProps {
  selectedModels: string[];
  selectedEnvironments: string[];
  sortField: string;
  sortDirection: string;
}

export interface UseFilteredTracesProps {
  traces: TraceData[];
  searchTerm: string;
  selectedModels: string[];
  selectedEnvironments: string[];
}

export interface UseSortedTracesProps {
  filteredTraces: TraceData[];
  sortField: SortField;
  sortDirection: SortDirection;
}
