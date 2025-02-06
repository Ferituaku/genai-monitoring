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

const CHART_COLORS = {
  prompt: "#8884d8", // Purple
  completion: "#82ca9d", // Green
};

interface TokenUsageData {
  date: string;
  prompt: number;
  completion: number;
}

export default function TokenUsage() {
  const [requestData, setRequestData] = useState<TokenUsageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const days = searchParams.get("days");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched Data:", data);

        if (Array.isArray(data?.token_usage)) {
          // Sesuaikan format data untuk Recharts dengan tipe eksplisit
          const formattedData: TokenUsageData[] = data.token_usage.map((item: any) => ({
            date: item.date,
            prompt: item.prompt,
            completion: item.completion,
          }));
          setRequestData(formattedData);
        } else {
          throw new Error("Data format tidak sesuai");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data.");
      } finally {
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
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={requestData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
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
            dataKey="prompt"
            stroke={CHART_COLORS.prompt}
            name="Prompt Tokens"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="completion"
            stroke={CHART_COLORS.completion}
            name="Completion Tokens"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
