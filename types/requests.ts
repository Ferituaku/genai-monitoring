// import { SortDirection, SortField, TraceData } from "./trace";

import { SortDirection, SortField } from "./trace";

// export interface TraceFilters {
//   sortField: string;
//   sortDirection: string;
//   timeFrame: {
//     from?: string;
//     to?: string;
//     days?: string;
//   };
//   filters: {
//     system?: string;
//     models?: string;
//     operationName?: string;
//     endpoint?: string;
//     tokenRange?: {
//       input?: { min?: number; max?: number };
//       output?: { min?: number; max?: number };
//       total?: { min?: number; max?: number };
//     };
//     duration?: {
//       min?: number;
//       max?: number;
//     };
//     isStream?: boolean;
//     environments?: string[];
//   };
// }

// export interface UseFilteredTracesProps {
//   traces: TraceData[];
//   searchTerm: string;
//   selectedModels: string[];
//   selectedEnvironments: string[];
// }

// export interface UseSortedTracesProps {
//   filteredTraces: TraceData[];
//   sortField: SortField;
//   sortDirection: SortDirection;
// }

export interface TraceFilters {
  appName?: string;
  timeFrame: {
    from?: string;
    to?: string;
    days?: string;
  };
  filters: {
    searchTerm?: string;
    // system?: string;
    models?: string[];
    environments?: string[];
    // operationName?: string;
    // endpoint?: string;
    tokenRange: {
      input: { min: number; max: number };
      output: { min: number; max: number };
      total: { min: number; max: number };
    };
    duration: { min?: number; max?: number };
    isStream: boolean;
  };
  sortField: SortField;
  sortDirection: SortDirection;
}
