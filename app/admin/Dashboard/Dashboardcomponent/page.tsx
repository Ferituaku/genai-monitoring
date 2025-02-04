"use client";

// import { div } from "framer-motion/client";
import React, { useState } from "react";
import MetricCard from "@/components/MetricCard";
import DonutChart from "@/components/DonutChart";
import ChartRequest from "@/components/ChartRequest";
import TimeFrame from "@/components/TimeFrame";
import Totalrequests from "./Angka/total_request";
import Avgtoken from "./Angka/avg_token";
import Avgcost from "./Angka/avg_cost";
import Avgduration from "./Angka/avg_duration";

import Avgprompttokens from "./Angka/avg_prompt_tokens";
import Avgcompletiontokens from "./Angka/avg_completion_tokens";



const Dashboard: React.FC = () => {

  //waktu/time frame masih dummy belum ada penyesuaian dengan data yg difetch dari api database openlitnye, sama custom belum dikasih date range picker

  return (
    <div className="min-h-screen">
      <div className="p-2 pt-20">
      
      <div className="flex relative items-center gap-4">
              <TimeFrame />
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

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
