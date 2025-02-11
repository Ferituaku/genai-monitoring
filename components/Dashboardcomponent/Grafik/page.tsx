"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CHART_COLOR = "#4f46e5"; // Warna garis total

type RequestPerTime = { date: string; total: number; total_ok: number; total_error: number; total_unset: number; };
type TokenUsage = { date: string; total: number; prompt: number; completion: number; };

export default function Angka() {
  const [requestData, setRequestData] = useState<RequestPerTime[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const days = useSearchParams().get("days") || "30"; // Default 7 hari jika tidak ada parameter

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched Data:", data);

        if (Array.isArray(data["request_pertime"])) {
          setRequestData(data["request_pertime"].map((item: any) => ({
            date: item.date,
            total: item.total_count_ok + item.total_count_error + item.total_count_unset,
            total_ok: item.total_count_ok,
            total_error: item.total_count_error,
            total_unset: item.total_count_unset
          })));
        }

        if (Array.isArray(data["token_usage"])) {
          setTokenUsage(data["token_usage"].map((item: any) => ({
            date: item.date,
            total: item.prompt + item.completion,
            prompt: item.prompt,
            completion: item.completion,
          })));
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

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Request Per Time</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={requestData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
            <YAxis tick={{ fill: "#6b7280" }} />
            <Tooltip content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-2 shadow-md rounded border border-gray-300">
                  <p className="text-sm font-bold">{data.date}</p>
                  <p className="text-xs">Total Requests: {data.total}</p>
                  <p className="text-xs text-green-600">OK: {data.total_ok}</p>
                  <p className="text-xs text-red-600">Error: {data.total_error}</p>
                  <p className="text-xs text-yellow-600">Unset: {data.total_unset}</p>
                </div>
              );
            }} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke={CHART_COLOR} name="Total Requests" strokeWidth={2} dot={{ strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-lg font-bold mt-6 mb-2">Token Usage</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={tokenUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
            <YAxis tick={{ fill: "#6b7280" }} />
            <Tooltip content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-2 shadow-md rounded border border-gray-300">
                  <p className="text-sm font-bold">{data.date}</p>
                  <p className="text-xs">Total Tokens: {data.total}</p>
                  <p className="text-xs text-green-600">Prompt: {data.prompt}</p>
                  <p className="text-xs text-red-600">Completion: {data.completion}</p>
                </div>
              );
            }} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#e63946" name="Token Usage" strokeWidth={2} dot={{ strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
