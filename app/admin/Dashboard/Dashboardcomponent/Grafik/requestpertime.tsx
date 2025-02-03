"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RequestData {
  ok: number;
  unset: number;
  error: number;
}

interface StatsData {
  Prompt_Error: number;
  Prompt_OK: number;
  Prompt_Unset: number;
}
const CHART_COLORS = {
  ok: "#82ca9d", // Green for success
  unset: "#8884d8", // Purple for unset
  error: "#ff4d4f", // Red for errors
} as const;

export default function Requestpertime() {
  const [requestData, setRequestData] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const searchParams = useSearchParams();  // Mengambil query parameter dari URL

  // Mendapatkan nilai 'days' dari parameter query URL
  const days = searchParams.get("days");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
        const data: StatsData = await response.json();
        console.log("Fetched Data:", data);

        if (
          data?.Prompt_Error !== undefined &&
          data?.Prompt_OK !== undefined &&
          data?.Prompt_Unset !== undefined
        ) {
          // Create multiple data points for better visualization
          const dataPoints = [
            {
              name: "Masi data total harusnya dibuat perhari gt",
              ok: data.Prompt_OK,
              unset: data.Prompt_Unset,
              error: data.Prompt_Error,
            },
          ];

          setRequestData(dataPoints);
        } else {
          console.error("Data tidak sesuai format yang diharapkan");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [days]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px] text-red-500">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] p-4">
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={requestData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
          <YAxis tick={{ fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ok"
            stroke={CHART_COLORS.ok}
            name="OK"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="unset"
            stroke={CHART_COLORS.unset}
            name="Unset"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="error"
            stroke={CHART_COLORS.error}
            name="Error"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
