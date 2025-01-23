"use client";
import React, { useState } from "react";

const page = () => {
  const [activeTab, setActiveTab] = useState("24H");
  const timeRanges = ["24H", "7D", "1M", "3M", "1Y"];

  // const handleTabClick = (tab: string) => {
  //   setActivateTab(tab);
  // };
  const areaChartData = [
    { name: "Jan", success: 400, error: 240 },
    { name: "Feb", success: 300, error: 139 },
    { name: "Mar", success: 200, error: 980 },
    { name: "Apr", success: 278, error: 390 },
    { name: "May", success: 189, error: 480 },
  ];
  return (
    <div className="bg-gradient-to-b from-slate-700 to-slate-900 min-h-screen">
      <div className="ml-60 p-4 pt-28 rounded-md">
        <div>
          <div className="sticky flex gap-2 mb-6">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveTab(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === range
                    ? "bg-primary text-white"
                    : "bg-slate-800 bg-opacity-50 text-slate-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex w-full justify-between">
              <div className="flex items-center rounded-t py-1 px-3 z-0 self-start bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                <div className="flex items-center pr-3">12231</div>
                <div className="flex items-center pl-3 border-l border-slate-600">
                  123131
                </div>
              </div>
            </div>
            <div className="flex h-16 relative items-center px-3 cursor-pointer  dark:text-stone-100 text-stone-950 border border-stone-200 dark:border-stone-800 rounded-md">
              <div className="flex w-3/12 shrink-0 flex-1 relative h-full items-center p-2 gap-2 overflow-hidden">
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex w-full justify-between">
              <div className="flex items-center rounded-t py-1 px-3 z-0 self-start bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                <div className="flex items-center pr-3">12231</div>
                <div className="flex items-center pl-3 border-l border-slate-600">
                  123131
                </div>
              </div>
            </div>
            <div className="flex h-16 relative items-center px-3 cursor-pointer  dark:text-stone-100 text-stone-950 border border-stone-200 dark:border-stone-800 rounded-md">
              <div className="flex w-3/12 shrink-0 flex-1 relative h-full items-center p-2 gap-2 overflow-hidden">
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex w-full justify-between">
              <div className="flex items-center rounded-t py-1 px-3 z-0 self-start bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                <div className="flex items-center pr-3">12231</div>
                <div className="flex items-center pl-3 border-l border-slate-600">
                  123131
                </div>
              </div>
            </div>
            <div className="flex h-16 relative items-center px-3 cursor-pointer  dark:text-stone-100 text-stone-950 border border-stone-200 dark:border-stone-800 rounded-md">
              <div className="flex w-3/12 shrink-0 flex-1 relative h-full items-center p-2 gap-2 overflow-hidden">
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex w-full justify-between">
              <div className="flex items-center rounded-t py-1 px-3 z-0 self-start bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                <div className="flex items-center pr-3">12231</div>
                <div className="flex items-center pl-3 border-l border-slate-600">
                  123131
                </div>
              </div>
            </div>
            <div className="flex h-16 relative items-center px-3 cursor-pointer  dark:text-stone-100 text-stone-950 border border-stone-200 dark:border-stone-800 rounded-md">
              <div className="flex w-3/12 shrink-0 flex-1 relative h-full items-center p-2 gap-2 overflow-hidden">
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
