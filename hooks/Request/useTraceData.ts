import { useState, useEffect, useCallback } from "react";
import { TraceData } from "@/types/trace";
import { useSearchParams } from "next/navigation";
import { getTimeFrameParams } from "@/lib/TimeFrame/api";
import { TraceFilters } from "@/types/requests";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

export const useTraceData = ({
  sortField,
  sortDirection,
  filters,
}: TraceFilters) => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const ambilDataTrace = useCallback(async () => {
    let isMounted = true; // Mencegah memory leak

    try {
      setLoading(true);
      setError(null);

      const parameterWaktu = getTimeFrameParams(searchParams);
      
      const data = await fetchTraces({
        sortField,
        sortDirection,
        timeFrame: parameterWaktu,
        filters,
      });

      if (!isMounted) return;

      setTraces(data);
    } catch (err) {
      if (!isMounted) return;

      const pesanError =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data";

      setError(pesanError);
      console.error("Error dalam useTraceData:", err);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [searchParams, sortField, sortDirection, JSON.stringify(filters)]);

  useEffect(() => {
    ambilDataTrace();
  }, [ambilDataTrace]);

  return { traces, loading, error };
};

export const fetchTraces = async ({
  timeFrame,
  filters,
}: TraceFilters): Promise<TraceData[]> => {
  const queryParams = new URLSearchParams();

  // Parameter waktu
  if (timeFrame.from && timeFrame.to) {
    queryParams.set("from", timeFrame.from);
    queryParams.set("to", timeFrame.to);
  } else if (timeFrame.days) {
    queryParams.set("days", timeFrame.days);
  }

  // Parameter filter
  if (filters.environments?.length) {
    queryParams.set("deployment_environment", filters.environments.join(","));
  }

  // Filter tambahan
  const tambahkanFilter = (nama: string, nilai: any) => {
    if (nilai !== undefined) {
      queryParams.set(nama, nilai.toString());
    }
  };

  tambahkanFilter("system", filters.system);
  tambahkanFilter("model", filters.models);
  tambahkanFilter("operation_name", filters.operationName);
  tambahkanFilter("endpoint", filters.endpoint);

  // Filter token range
  if (filters.tokenRange) {
    const { input, output, total } = filters.tokenRange;

    if (input) {
      tambahkanFilter("min_input_tokens", input.min);
      tambahkanFilter("max_input_tokens", input.max);
    }

    if (output) {
      tambahkanFilter("min_output_tokens", output.min);
      tambahkanFilter("max_output_tokens", output.max);
    }

    if (total) {
      tambahkanFilter("min_total_tokens", total.min);
      tambahkanFilter("max_total_tokens", total.max);
    }
  }

  // Filter durasi dan stream
  if (filters.duration) {
    tambahkanFilter("min_duration", filters.duration.min);
    tambahkanFilter("max_duration", filters.duration.max);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tracesRequest/?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`Kesalahan HTTP! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error dalam fetchTraces:", error);
    throw new Error(
      error instanceof Error ? error.message : "Gagal mengambil data trace"
    );
  }
};
