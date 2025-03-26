// hooks/Request/use-filter-options.ts
import { useState, useEffect } from "react";
import { fetchFilterOptions } from "@/lib/RequestService/api";

export const useFilterOptions = () => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableEnvironments, setAvailableEnvironments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFilterOptions = async () => {
      try {
        setLoading(true);
        const data = await fetchFilterOptions();
        
        setAvailableModels(data.models || []);
        setAvailableEnvironments(data.environments || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    getFilterOptions();
  }, []);

  return {
    availableModels,
    availableEnvironments,
    loading,
    error
  };
};