"use client";

// import { div } from "framer-motion/client";
import React, { useState } from "react";
import MetricCard from "@/components/MetricCard";
import ChartRequest from "@/components/ChartRequest";
import TimeFrame from "@/components/TimeFrame";
import Totalrequests from "./total_request";
import Avgtoken from "./avg_token";
import Avgcost from "./avg_cost";
import Avgduration from "./avg_duration";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="top-2 right-0 z-10 pt-4 gap-4">
        <div className="flex mb-4 relative items-center gap-4">
          <TimeFrame />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Request"
            value={<Totalrequests />}
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
            value={<Avgtoken />}
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
            value={<Avgcost />}
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
            value={<Avgduration />}
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

      
       
      </div>
    </div>
  );
};

export default Dashboard;
