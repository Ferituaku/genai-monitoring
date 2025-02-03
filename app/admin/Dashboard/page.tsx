"use client";

// import { div } from "framer-motion/client";
import React, { useState } from "react";
import MetricCard from "@/components/MetricCard";
import DonutChart from "@/components/DonutChart";
import ChartRequest from "@/components/ChartRequest";
import TimeFrame from "@/components/TimeFrame";
import Totalrequests from "./Dashboardcomponent/Angka/total_request";
import Avgtoken from "./Dashboardcomponent/Angka/avg_token";
import Avgcost from "./Dashboardcomponent/Angka/avg_cost";
import Avgduration from "./Dashboardcomponent/Angka/avg_duration";
import Requestpertime from "./Dashboardcomponent/Grafik/requestpertime";
import Costbyapp from "./Dashboardcomponent/Piechart/cost_by_app";
import Genbycategory from "./Dashboardcomponent/Piechart/gen_by_category";
import Costbyenv from "./Dashboardcomponent/Piechart/cost_by_env";
import Avgprompttokens from "./Dashboardcomponent/Angka/avg_prompt_tokens";
import Avgcompletiontokens from "./Dashboardcomponent/Angka/avg_completion_tokens";
import Tokenusage from "./Dashboardcomponent/Grafik/tokenusage";
import TopModel from "./Dashboardcomponent/Piechart/top_model";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("24H");
  const timeRanges = ["24H", "7D", "1M", "3M", "CUSTOM"];
  //waktu/time frame masih dummy belum ada penyesuaian dengan data yg difetch dari api database openlitnye, sama custom belum dikasih date range picker

  return (
    <div className="min-h-screen">
      <div className="p-2 pt-20">
      
      <div className="flex relative items-center gap-4">
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
          <div className=" col-span-2 mb-2 bg-white p-6 rounded-lg shadow-lg min-h-[400px]">
            <h2 className="text-md font-light text-slate-700 mb-4">
              Request per Time
            </h2>
            <Requestpertime />
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4  ">
          <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-1 gap-6 mb-4 min-h-[450px]">
            <MetricCard
              title="Avg prompt tokens / request"
              value= {<Avgprompttokens/>}
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
              title="Avg completion tokens / request"
              value={<Avgcompletiontokens/>}
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
          </div>
          <div className="col-span-2 mb-4 bg-white p-4 rounded-lg shadow-lg">
            <Tokenusage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
