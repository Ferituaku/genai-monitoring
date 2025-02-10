// hooks/Request/useTraceData.ts
import { useState, useEffect } from "react";
import { TraceData } from "@/types/trace";
import { useSearchParams } from "next/navigation";

interface UseTraceDataProps {
  selectedModels: string[];
  selectedEnvironments: string[];
  sortField: string;
  sortDirection: string;
}

export const useTraceData = ({
  selectedModels,
  selectedEnvironments,
  sortField,
  sortDirection,
}: UseTraceDataProps) => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const days = searchParams?.get("days") || "7";

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        // Construct query parameters
        const queryParams = new URLSearchParams({
          days: days,
          ...(selectedModels.length && { model: selectedModels.join(",") }),
          ...(selectedEnvironments.length && {
            deployment_environment: selectedEnvironments.join(","),
          }),
          ...(sortField && { sort_field: sortField }),
          ...(sortDirection && { sort_direction: sortDirection }),
        });

        const response = await fetch(
          `http://localhost:5000/api/tracesRequest/?${queryParams}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch traces");
        }

        const data = await response.json();
        setTraces(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, [days, selectedModels, selectedEnvironments, sortField, sortDirection]);

  return { traces, loading, error };
};
