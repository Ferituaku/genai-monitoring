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

interface StatsData {
  Prompt: number;
  Completion: number;
}

const CHART_COLORS = {
  promptrequest: "#82ca9d", // Green for prompt
  completionrequest: "#8884d8", // Purple for completion
} as const;

export default function Tokenusage() {
  const [requestData, setRequestData] = useState<any[]>([]); // Tipe data bisa lebih diperjelas
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

        if (data?.Prompt !== undefined && data?.Completion !== undefined) {
          // Mengubah format data menjadi format yang diterima oleh LineChart
          const dataPoints = [
            {
              name: "Data Perhari",
              promptrequest: data.Prompt,
              completionrequest: data.Completion,
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
            dataKey="promptrequest"
            stroke={CHART_COLORS.promptrequest}
            name="Prompt"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="completionrequest"
            stroke={CHART_COLORS.completionrequest}
            name="Completion"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
