import { UseFilteredTracesProps } from "@/types/requests";
import { TraceData } from "@/types/trace";
import { useMemo } from "react";

export const useFilteredTraces = ({
  traces,
  searchTerm,
  selectedModels,
  selectedEnvironments,
}: UseFilteredTracesProps) => {
  return useMemo(() => {
    return traces.filter((trace) => {
      const model = trace.SpanAttributes["gen_ai.request.model"] || "";
      const environment =
        trace.ResourceAttributes["deployment.environment"] || "";

      const matchesSearchTerm = trace.ServiceName.toLowerCase().includes(
        searchTerm.toLowerCase()
      );

      const matchesModel =
        selectedModels.length === 0 || selectedModels.includes(model);

      const matchesEnvironment =
        selectedEnvironments.length === 0 ||
        selectedEnvironments.includes(environment);

      return matchesSearchTerm && matchesModel && matchesEnvironment;
    });
  }, [traces, searchTerm, selectedModels, selectedEnvironments]);
};
