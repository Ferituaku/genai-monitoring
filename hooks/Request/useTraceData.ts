// hooks/Request/useTraceData.ts
import { useState, useEffect } from "react";
import { TraceData } from "@/types/trace";
import { useSearchParams } from "next/navigation";
import { UseTraceDataProps } from "@/types/requests";

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
  const fromDate = searchParams?.get("from");
  const toDate = searchParams?.get("to");

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        // Construct query parameters
        const queryParams = new URLSearchParams();

        // Add time parameters
        if (fromDate && toDate) {
          queryParams.set("from", fromDate);
          queryParams.set("to", toDate);
        } else if (days) {
          queryParams.set("days", days);
        } else {
          queryParams.set("days", "7"); // Default
        }

        // Add other parameters
        if (selectedModels.length) {
          queryParams.set("model", selectedModels.join(","));
        }
        if (selectedEnvironments.length) {
          queryParams.set(
            "deployment_environment",
            selectedEnvironments.join(",")
          );
        }
        if (sortField) {
          queryParams.set("sort_field", sortField);
        }
        if (sortDirection) {
          queryParams.set("sort_direction", sortDirection);
        }

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
  }, [
    days,
    fromDate,
    toDate,
    selectedModels,
    selectedEnvironments,
    sortField,
    sortDirection,
  ]);

  return { traces, loading, error };
};
