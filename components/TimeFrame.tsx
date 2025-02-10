"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const TimeFrame = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("7D");
  const timeRanges: Record<string, number | null> = {
    "24H": 1,
    "7D": 7,
    "1M": 30,
    "3M": 90,
    CUSTOM: null,
  };

  useEffect(() => {
    const daysFromUrl = searchParams.get("days");
    if (daysFromUrl) {
      const matchedKey = Object.keys(timeRanges).find(
        (key) => timeRanges[key]?.toString() === daysFromUrl
      );
      if (matchedKey) setActiveTab(matchedKey);
    }
  }, [searchParams]);

  const handleTimeframeChange = (range: string) => {
    setActiveTab(range);
    const days = timeRanges[range];

    const params = new URLSearchParams(searchParams);
    if (days !== null) {
      params.set("days", days.toString());
    } else {
      params.delete("days");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="items-center gap-4 pl-2 pr-0 rounded-3xl shadow-md py-2 px-4 w-80 " style={{ backgroundColor: "#3F79D2" }}>
      {Object.keys(timeRanges).map((range) => (
        <button
          key={range}
          onClick={() => handleTimeframeChange(range)}
          className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
            activeTab === range
              ? "bg-primary text-white"
              : "bg-light text-secondary hover:text-slate-100"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

export default TimeFrame;
