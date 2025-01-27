"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sheet } from "lucide-react";
import React, { useState } from "react";
import { Label } from "recharts";

const page = () => {
  const [activeTab, setActiveTab] = useState("24H");
  const timeRanges = ["24H", "7D", "1M", "3M", "CUSTOM"];

  const areaChartData = [
    { name: "Jan", success: 400, error: 240 },
    { name: "Feb", success: 300, error: 139 },
    { name: "Mar", success: 200, error: 980 },
    { name: "Apr", success: 278, error: 390 },
    { name: "May", success: 189, error: 480 },
  ];
  return (
    <div className="min-h-screen">
      <div className="ml-60 p-4 top-0 rounded-md">
        <div>
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
          <div className="flex flex-col mt-2">
            <div className="flex w-full justify-between">
              <div className="flex items-center rounded-t py-1 px-3 z-0 self-start bg-blue-500/50 dark:bg-stone-800 text-slate-600 dark:text-stone-400 font-medium text-sm">
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
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
                <div className="flex flex-col w-full justify-center space-y-1">
                  <span className="leading-none text-ellipsis pb-2 overflow-hidden whitespace-nowrap font-medium">
                    AppFerro
                  </span>
                  <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap text-stone-500 dark:text-stone-500">
                    Service Name
                  </span>
                </div>
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
