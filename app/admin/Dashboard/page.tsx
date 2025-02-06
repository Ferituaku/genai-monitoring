"use client";

// import { div } from "framer-motion/client";
import React, { useState } from "react";
import MetricCard from "@/components/MetricCard";
import ChartRequest from "@/components/ChartRequest";
import TimeFrame from "@/components/TimeFrame";
import Totalrequests from "./Dashboardcomponent/Angka/total_request";
import Avgtoken from "./Dashboardcomponent/Angka/avg_token";
import Avgcost from "./Dashboardcomponent/Angka/avg_cost";
import Avgduration from "./Dashboardcomponent/Angka/avg_duration";
import Costbyapp from "./Dashboardcomponent/Piechart/cost_by_app";
import Genbycategory from "./Dashboardcomponent/Piechart/gen_by_category";
import Costbyenv from "./Dashboardcomponent/Piechart/cost_by_env";
import Avgprompttokens from "./Dashboardcomponent/Angka/avg_prompt_tokens";
import Avgcompletiontokens from "./Dashboardcomponent/Angka/avg_completion_tokens";
import Tokenusage from "./Dashboardcomponent/Grafik/tokenusage";
import TopModel from "./Dashboardcomponent/Piechart/top_model";
import RequestPerTimeChart from "./Dashboardcomponent/Grafik/requestpertime";
import TokenUsage from "./Dashboardcomponent/Grafik/tokenusage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import DynamicBreadcrumb from "@/components/Breadcrum";

const Dashboard: React.FC = () => {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className=" col-span-2 mb-2 bg-white p-6 rounded-lg shadow-lg min-h-[500px]">
            <h2 className="text-md font-light text-slate-700 mb-4">
              Request per Time
            </h2>
            <RequestPerTimeChart />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 mb-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Cost by application
              </h2>
              <Costbyapp />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Generate by category
              </h2>
              <Genbycategory />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Cost by environment
              </h2>
              <Costbyenv />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-md font-light text-slate-700 mb-4">
                Top Models
              </h2>
              <TopModel />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="grid lg:grid-rows-2 gap-6 mb-4">
            <MetricCard
              title="Avg prompt tokens / request"
              value={<Avgprompttokens />}
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
              value={<Avgcompletiontokens />}
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
          <div className="col-span-3 mb-2 bg-white p-6 rounded-lg shadow-lg min-h-[320px]">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Token Usage
            </h2>
            <TokenUsage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
