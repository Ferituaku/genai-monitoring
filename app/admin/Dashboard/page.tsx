"use client";

// import { div } from "framer-motion/client";
import React, { useState, useEffect } from "react";
import TimeFrame from "@/components/TimeFrame/TimeFrame";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { useSearchParams } from "next/navigation";
<<<<<<< HEAD
import Genbycategory from "../../../components/DashboardComponent/Piechart/Genbycategory";
import Costbyapp from "../../../components/DashboardComponent/Piechart/Costbyapp";
import Costbyenv from "../../../components/DashboardComponent/Piechart/Costbyenv";
=======
import Topmodel from "@/components/Dashboardcomponent/Piechart/TopModel";
import Genbycategory from "../../../components/Dashboardcomponent/Piechart/Genbycategory";
import Costbyapp from "../../../components/Dashboardcomponent/Piechart/Costbyapp";
import Costbyenv from "../../../components/Dashboardcomponent/Piechart/Costbyenv";
>>>>>>> ead4d3ab29e42fb615615ffad28df02a7ddef08d
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
import { DashboardApiService } from "@/lib/DashboardService/api";
import { Loader2 } from "lucide-react";
// import METRIC_CARD from "@/components/DashboardComponent/MetricCard";
import METRIC_CARD from "@/components/Dashboardcomponent/MetricCard";
import { get_time_frame_params } from "@/hooks/TimeFrame/api";
import Topmodel from "@/components/DashboardComponent/Piechart/TopModel";

const DASHBOARD: React.FC = () => {
  const [DASHBOARD_DATA, SET_DASHBOARD_DATA] = useState<any>(null);
  const [ERROR, SET_ERROR] = useState<string | null>(null);
  const [IS_LOADING, SET_IS_LOADING] = useState(true);
  const SEARCH_PARAMS = useSearchParams();

  useEffect(() => {
    //FETCH data dashboard dari api.ts menggunakan get_dashboard_data
    const FETCH_DASHBOARD_DATA = async () => {
      try {
        SET_IS_LOADING(true);
        const TIME_FRAME_PARAMS = get_time_frame_params(SEARCH_PARAMS);
        const DATA = await DashboardApiService.get_dashboard_data(
          TIME_FRAME_PARAMS
        );
        SET_DASHBOARD_DATA(DATA);
        SET_ERROR(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        SET_ERROR(error instanceof Error ? error.message : "An error occurred");
      } finally {
        SET_IS_LOADING(false);
      }
    };

    FETCH_DASHBOARD_DATA();
  }, [SEARCH_PARAMS]);

  const processRequestData = (data: any) => {
    return Object.keys(data).map((date) => {
      const statusArray = data[date];
      const total_ok = parseInt(statusArray[0].split(": ")[1]);
      const total_unset = parseInt(statusArray[1].split(": ")[1]);
      const total_error = parseInt(statusArray[2].split(": ")[1]);

      return {
        date: date,
        total: total_ok + total_unset + total_error,
        total_ok,
        total_unset,
        total_error,
      };
    });
  };


  const processTokenData = (data: Record<string, string[]>) => {
    return Object.keys(data).map((date) => {
      const statusArray = data[date]; // Sekarang TypeScript tahu ini adalah string[]
      const total_prompt = parseInt(statusArray[0].split(": ")[1]);
      const total_completion = parseInt(statusArray[1].split(": ")[1]);
  
      return {
        date: date,
        total: total_prompt + total_completion,
        total_prompt,
        total_completion,
      };
    });
  };
  


  if (IS_LOADING) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (ERROR) {
    return (
      <div className="flex justify-center items-center h-[300px] text-red-500">
        <p>Error loading data: {ERROR}</p>
      </div>
    );
  }

  const REQUEST_DATA = DASHBOARD_DATA?.request_pertime
    ? processRequestData(DASHBOARD_DATA.request_pertime)
    : [];
  const TOKEN_USAGE = DASHBOARD_DATA?.token_usage
    ? processTokenData(DASHBOARD_DATA.token_usage)
    : [];


  return (
    <div className="min-h-screen">
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
      <div className="top-2 right-0 z-10 pt-2 gap-4">
        <div className="flex mb-4 relative items-center gap-4">
          <TimeFrame />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <METRIC_CARD
            title="Total Request"
            value={DASHBOARD_DATA?.total_requests?.toString()}
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
          <METRIC_CARD
            title="Avg tokens per request"
            value={DASHBOARD_DATA?.avg_token?.toString()}
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
          <METRIC_CARD
            title="Avg Cost per request"
            value={DASHBOARD_DATA?.avg_cost?.toString()}
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
          <METRIC_CARD
            title="Avg Request Duration"
            value={DASHBOARD_DATA?.avg_duration?.toString()}
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
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={REQUEST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const DATA = payload[0].payload;
                    return (
                      <div className="bg-white p-2 shadow-md rounded border border-gray-300">
                        <p className="text-sm font-bold">{DATA.date}</p>
                        <p className="text-xs">Total Requests: {DATA.total}</p>
                        <p className="text-xs text-green-600">OK: {DATA.total_ok}</p>
                        <p className="text-xs text-red-600">Error: {DATA.total_error}</p>
                        <p className="text-xs text-yellow-600">Unset: {DATA.total_unset}</p>
                      </div>
                    );
                  }}
                />
<Legend />
                <Line
                  type="monotone"
                  dataKey="total_ok"
                  stroke="#10b981"
                  name="Status OK"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_error"
                  stroke="#ef4444"
                  name="Status Error"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_unset"
                  stroke="#f59e0b"
                  name="Status Unset"
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
              <Costbyapp data={DASHBOARD_DATA?.["cost_by_app"] || {}} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Generate by category
              </h2>
              <Genbycategory data={DASHBOARD_DATA?.["gen_by_category"] || {}} /> 
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Cost by environment
              </h2>
              <Costbyenv data={DASHBOARD_DATA?.["cost_by_env"] || {}} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Top Model
              </h2>
              <Topmodel data={DASHBOARD_DATA?.["top_model"] || {}} />
            </div>
          </div> 

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            <METRIC_CARD
              title="Avg prompt tokens / request"
              value={DASHBOARD_DATA?.avg_prompt_tokens?.toString()}
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
            <METRIC_CARD
              title="Avg completion tokens / request"
              value={DASHBOARD_DATA?.avg_completion_tokens?.toString()}
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
            <h2 className="text-lg font-bold mb-2">Token Usage</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={TOKEN_USAGE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    className="text-xs"
                    dataKey="date"
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const DATA = payload[0].payload;
                      return (
                         <div className="bg-white p-2 shadow-md rounded border border-gray-300">
                            <p className="text-sm font-bold">{DATA.date}</p>
                            <p className="text-xs">Total Requests: {DATA.total}</p>
                            <p className="text-xs text-green-600">total prompt: {DATA.total_prompt}</p>
                            <p className="text-xs text-red-600">total completion: {DATA.total_completion}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_prompt"
                      stroke="#10b981"
                      name="Total Prompt"
                      strokeWidth={2}
                      dot={{ strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total_completion"
                      stroke="#ef4444"
                      name="Total Completion"
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

export default DASHBOARD;
