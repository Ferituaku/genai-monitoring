"use client";
import React, { useState } from "react";

const TimeFrame = () => {
  const [activeTab, setActiveTab] = useState("24H");
  const timeRanges = ["24H", "7D", "1M", "3M", "CUSTOM"];

  return (
    <div
      className="items-center gap-4 pl-2 pr-0 rounded-3xl shadow-md py-2 px-4 w-80 "
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
  );
};

export default TimeFrame;
