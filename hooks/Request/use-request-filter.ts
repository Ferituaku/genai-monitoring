import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Pastikan import ini sesuai
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
  const searchParams = useSearchParams(); // Ambil query params dari URL

  // Helper function to convert query param to array
  const getArrayFromParam = (param: string | string[] | null): string[] => {
    if (!param) return [];
    if (Array.isArray(param)) return param; // Jika sudah array, kembalikan langsung
    return param.split(","); // Jika string, pecah berdasarkan koma
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [tokenRange, setTokenRange] = useState({
    input: { min: 0, max: 4000 },
    output: { min: 0, max: 4000 },
    total: { min: 0, max: 8000 },
  });
  const [duration, setDuration] = useState({ min: 0, max: 10000 });
  const [isStream, setIsStream] = useState(false);

  // Update state dari URL params saat halaman dimuat atau berubah
  useEffect(() => {
    const models = getArrayFromParam(searchParams.getAll("model"));
    const environments = getArrayFromParam(searchParams.getAll("environment"));

    setSelectedModels(models);
    setSelectedEnvironments(environments);
  }, [searchParams]);

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
