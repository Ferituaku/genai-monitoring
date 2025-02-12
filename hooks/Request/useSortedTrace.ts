import { UseSortedTracesProps } from "@/types/requests";
import { useMemo } from "react";

export const useSortedTraces = ({
  filteredTraces,
  sortField,
  sortDirection,
}: UseSortedTracesProps) => {
  return useMemo(() => {
    return [...filteredTraces].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortField) {
        case "Timestamp":
          valueA = new Date(a.Timestamp).getTime();
          valueB = new Date(b.Timestamp).getTime();
          break;
        case "SpanAttributes.gen_ai.request.model":
          valueA = a.SpanAttributes["gen_ai.request.model"];
          valueB = b.SpanAttributes["gen_ai.request.model"];
          break;
        case "SpanAttributes.gen_ai.usage.total_tokens":
          valueA = parseInt(
            a.SpanAttributes["gen_ai.usage.total_tokens"] || "0"
          );
          valueB = parseInt(
            b.SpanAttributes["gen_ai.usage.total_tokens"] || "0"
          );
          break;
        case "SpanAttributes.gen_ai.usage.cost":
          valueA = parseFloat(a.SpanAttributes["gen_ai.usage.cost"] || "0");
          valueB = parseFloat(b.SpanAttributes["gen_ai.usage.cost"] || "0");
          break;
        default:
          valueA = a.Timestamp;
          valueB = b.Timestamp;
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTraces, sortField, sortDirection]);
};
