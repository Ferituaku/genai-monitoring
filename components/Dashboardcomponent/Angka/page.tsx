"use client";

// import { div } from "framer-motion/client";
import React, { useState, useEffect } from "react";
import MetricCard from "@/components/MetricCard";
import TimeFrame from "@/components/TimeFrame";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { useSearchParams } from "next/navigation";


const Dashboard: React.FC = () => {
  const [avg_completion_tokens, setAvgCompletionTokens] = useState(0);
  const [avg_cost, setAvgCost] = useState(0);
  const [avg_duration, setAvgDuration] = useState(0);
  const [avg_prompt_tokens, setAvgPromptTokens] = useState(0);
  const [avg_token, setAvgToken] = useState(0);
  const [total_requests, setTotalRequest] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  // const days = searchParams.get("days");
  const days = searchParams.get("days") || "7"; 

  useEffect(() => {
    const fetchData = async () => {
      if (!days) return;

      try {
        const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
        
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
        value= {total_requests.toString()}
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

       
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="grid lg:grid-rows-2 gap-6 mb-4">
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
        
        </div>
    </div>
    </div>
    
  );
};

export default Dashboard;
