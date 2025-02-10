"use client";

// import { div } from "framer-motion/client";
import React, { useState, useEffect } from "react";
import MetricCard from "@/components/MetricCard";
import TimeFrame from "@/components/TimeFrame";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { useSearchParams } from "next/navigation";
import TopModel from "./Dashboardcomponent/Piechart/TopModel";
import Genbycategory from "./Dashboardcomponent/Piechart/Genbycategory";
import Costbyapp from "./Dashboardcomponent/Piechart/Costbyapp";
import Costbyenv from "./Dashboardcomponent/Piechart/Costbyenv";
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

const Dashboard: React.FC = () => {
  const [avg_completion_tokens, setAvgCompletionTokens] = useState(0);
  const [avg_cost, setAvgCost] = useState(0);
  const [avg_duration, setAvgDuration] = useState(0);
  const [avg_prompt_tokens, setAvgPromptTokens] = useState(0);
  const [avg_token, setAvgToken] = useState(0);
  const [total_requests, setTotalRequest] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const CHART_COLOR = "#4f46e5"; // Warna garis total
  type RequestPerTime = {
    date: string;
    total: number;
    total_ok: number;
    total_error: number;
    total_unset: number;
  };
  type TokenUsage = {
    date: string;
    total: number;
    prompt: number;
    completion: number;
  };
  const searchParams = useSearchParams();
  // const days = searchParams.get("days");
  const days = searchParams?.get("days") || "7";
  const [requestData, setRequestData] = useState<RequestPerTime[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!days) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/dashboard?days=${days}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setAvgCompletionTokens(data?.avg_completion_tokens ?? 0);
        setAvgCost(data?.avg_cost ?? 0);
        setAvgDuration(data?.avg_duration ?? 0);
        setAvgPromptTokens(data?.avg_prompt_tokens ?? 0);
        setAvgToken(data?.avg_token ?? 0);
        setTotalRequest(data?.total_requests ?? 0);
        setData(data);
        if (Array.isArray(data["request_pertime"])) {
          setRequestData(
            data["request_pertime"].map((item: any) => ({
              date: item.date,
              total:
                item.total_count_ok +
                item.total_count_error +
                item.total_count_unset,
              total_ok: item.total_count_ok,
              total_error: item.total_count_error,
              total_unset: item.total_count_unset,
            }))
          );
        }

        if (Array.isArray(data["token_usage"])) {
          setTokenUsage(
            data["token_usage"].map((item: any) => ({
              date: item.date,
              total: item.prompt + item.completion,
              prompt: item.prompt,
              completion: item.completion,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px] text-red-500">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
      <div className="top-2 right-0 z-10 pt-4 gap-4">
        <div className="flex mb-4 relative items-center gap-4">
          <TimeFrame />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Request"
            value={total_requests.toString()}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-600
            "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            }
            subValue=""
          />
          <MetricCard
            title="Avg tokens per request"
            value={avg_token.toString()}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-600
            "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            subValue=""
          />
          <MetricCard
            title="Avg Cost per request"
            value={avg_cost.toString()}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-600
            "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            subValue=""
          />
          <MetricCard
            title="Avg Request Duration"
            value={avg_duration.toString()}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-600
            "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            subValue=""
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 mb-4 bg-white p-4 rounded-lg shadow-lg h-auto">
            <h2 className="text-lg font-bold mb-2">Request Per Time</h2>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 shadow-md rounded border border-gray-300">
                        <p className="text-sm font-bold">{data.date}</p>
                        <p className="text-xs">Total Requests: {data.total}</p>
                        <p className="text-xs text-green-600">
                          OK: {data.total_ok}
                        </p>
                        <p className="text-xs text-red-600">
                          Error: {data.total_error}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Unset: {data.total_unset}
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={CHART_COLOR}
                  name="Total Requests"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 mb-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Cost by application
              </h2>
              <Costbyapp data={data?.["Cost by app"] || {}} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Generate by category
              </h2>
              <Genbycategory data={data?.["Gen by category"] || {}} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Cost by environment
              </h2>
              <Costbyenv data={data?.["Cost by env"] || {}} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Top Models
              </h2>
              <TopModel data={data?.["Top Model"] || {}} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            <MetricCard
              title="Avg prompt tokens / request"
              value={avg_prompt_tokens.toString()}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-terminal"
                >
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" x2="20" y1="19" y2="19" />
                </svg>
              }
              subValue=""
            />
            <MetricCard
              title="Avg completion tokens / request"
              value={avg_completion_tokens.toString()}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list-check"
                >
                  <path d="M11 18H3" />
                  <path d="m15 18 2 2 4-4" />
                  <path d="M16 12H3" />
                  <path d="M16 6H3" />
                </svg>
              }
              subValue=""
            />
          </div>
          <div className="col-span-2 mb-4 bg-white p-4 rounded-2xl shadow-lg h-auto">
            <h2 className="text-lg font-bold mb-2">Request Per Time</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={tokenUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 shadow-md rounded border border-gray-300">
                          <p className="text-sm font-bold">{data.date}</p>
                          <p className="text-xs">Total Tokens: {data.total}</p>
                          <p className="text-xs text-green-600">
                            Prompt: {data.prompt}
                          </p>
                          <p className="text-xs text-red-600">
                            Completion: {data.completion}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#e63946"
                    name="Token Usage"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
