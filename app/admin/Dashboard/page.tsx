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

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("24H");
  const timeRanges = ["24H", "7D", "1M", "3M", "CUSTOM"];
  //waktu/time frame masih dummy belum ada penyesuaian dengan data yg difetch dari api database openlitnye, sama custom belum dikasih date range picker

  return (
    <div className="min-h-screen">
      <div className="p-2 pt-20">
        <div
          className="items-center gap-4 pl-2 pr-0 rounded-3xl shadow-md py-2 px-4 w-80 mb-4"
          style={{ backgroundColor: "#3F79D2" }}
        >
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveTab(range)}
              className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
                activeTab === range
                  ? "bg-primary text-white"
                  : "bg-light text-secondary hover:text-slate-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Request"
            value={<Totalrequests/>}

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
            value= {<Avgcost />}
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

            value= {<Avgduration />}

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

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
          <div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
            <Requestpertime />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
            <div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
              <h1>cost by app</h1>
              <Costbyapp />
            </div>
            <div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
              <h1>Generate by category</h1>
              <Genbycategory />
            </div>
            <div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
              <h1>Generate by category</h1>
              <Genbycategory />
            </div>
            <div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
              <h1>Generate by category</h1>
              <Genbycategory />
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              <MetricCard
                title="Avg prompt tokens / request"
                value="153"
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
                value="153"
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
            <div className="mb-4 bg-white p-4 rounded-lg shadow-lg">
              <Requestpertime/>
            </div>
           
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
