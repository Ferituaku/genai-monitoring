"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  createTimeFrameQueryString,
  getTimeFrameParams,
} from "@/lib/TimeFrame/api";

const TimeFrame = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("24H");
  const [date, setDate] = useState<DateRange | undefined>();
  const [tempDate, setTempDate] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);

  const timeRanges: Record<string, number | null> = {
    "24H": 1,
    "7D": 7,
    "1M": 30,
    "3M": 90,
    CUSTOM: null,
  };

  useEffect(() => {
    const timeParams = getTimeFrameParams(searchParams);

    if (timeParams.from && timeParams.to) {
      const dateRange = {
        from: new Date(timeParams.from),
        to: new Date(timeParams.to),
      };
      setDate(dateRange);
      setTempDate(dateRange);
      setActiveTab("CUSTOM");
    } else if (timeParams.days) {
      const matchedKey = Object.keys(timeRanges).find(
        (key) => timeRanges[key]?.toString() === timeParams.days
      );
      if (matchedKey) setActiveTab(matchedKey);
    }
  }, [searchParams]);

  const handleTimeframeChange = (range: string) => {
    setActiveTab(range);
    const days = timeRanges[range];
    if (days !== null) {
      const queryString = createTimeFrameQueryString({ days: days.toString() });
      router.push(`?${queryString.toString()}`, { scroll: false });
    } else {
      setOpen(true);
    }
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setTempDate(selectedDate);
  };

  const handleApplyDateRange = () => {
    if (tempDate?.from && tempDate?.to) {
      setDate(tempDate);
      const queryString = createTimeFrameQueryString({
        from: tempDate.from.toISOString(),
        to: tempDate.to.toISOString(),
      });
      router.push(`?${queryString}`, { scroll: false });
      setOpen(false);
    }
  };

  return (
    <div
      className="flex items-center pl-2 pr-0 rounded-3xl shadow-md py-2 px-4 w-80"
      style={{ backgroundColor: "#3F79D2" }}
    >
      {Object.keys(timeRanges).map((range) => (
        <button
          key={range}
          onClick={() => handleTimeframeChange(range)}
          className={cn(
            "px-4 py-2 rounded-3xl text-sm font-medium transition-colors",
            activeTab === range
              ? "bg-primary text-white"
              : "bg-light text-secondary hover:text-slate-100"
          )}
        >
          {range}
        </button>
      ))}
      {activeTab === "CUSTOM" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left px-4 py-2 rounded-3xl text-sm font-medium transition-colors ml-4",
                !date?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempDate?.from}
                selected={tempDate}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleApplyDateRange}
                  disabled={!tempDate?.from || !tempDate?.to}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default TimeFrame;
