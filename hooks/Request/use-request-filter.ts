// hooks/Request/use-request-filters.ts
import { useState, useCallback } from "react";
import { TokenRange, Filters } from "@/types/requests";

interface UseRequestFiltersReturn {
  filters: Filters;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  selectedEnvironments: string[];
  setSelectedEnvironments: (envs: string[]) => void;
  tokenRange: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  };
  setTokenRange: (range: {
    input: TokenRange;
    output: TokenRange;
    total: TokenRange;
  }) => void;
  duration: { min: number; max: number };
  setDuration: (duration: { min: number; max: number }) => void;
  isStream: boolean;
  setIsStream: (isStream: boolean) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

export const useRequestFilters = (): UseRequestFiltersReturn => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    []
  );
  const [tokenRange, setTokenRange] = useState({
    input: { min: 0, max: 4000 },
    output: { min: 0, max: 4000 },
    total: { min: 0, max: 8000 },
  });
  const [duration, setDuration] = useState({ min: 0, max: 10000 });
  const [isStream, setIsStream] = useState(false);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedModels([]);
    setSelectedEnvironments([]);
    setTokenRange({
      input: { min: 0, max: 4000 },
      output: { min: 0, max: 4000 },
      total: { min: 0, max: 8000 },
    });
    setDuration({ min: 0, max: 10000 });
    setIsStream(false);
  }, []);

  const filters: Filters = {
    models: selectedModels,
    environments: selectedEnvironments,
    tokenRange,
    duration,
    isStream,
  };

  const applyFilters = useCallback(() => {
    console.log("Applying filters:", filters);
  }, [filters]);

  return {
    filters,
    searchTerm,
    setSearchTerm,
    selectedModels,
    setSelectedModels,
    selectedEnvironments,
    setSelectedEnvironments,
    tokenRange,
    setTokenRange,
    duration,
    setDuration,
    isStream,
    setIsStream,
    resetFilters,
    applyFilters,
  };
};
