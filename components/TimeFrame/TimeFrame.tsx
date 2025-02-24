// components/TimeFrame/TimeFrame.tsx
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
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  createTimeFrameQueryString,
  get_time_frame_params,
  getDateRangeFromDays,
} from "@/hooks/TimeFrame/api";
import { TimeFrameParams } from "@/types/timeframe";

interface TimeFrameProps {
  onTimeFrameChange?: (timeFrame: TimeFrameParams) => void;
}

const TimeFrame: React.FC<TimeFrameProps> = ({ onTimeFrameChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("7D");
  const [date, setDate] = useState<DateRange | undefined>();
  const [tempDate, setTempDate] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const TIME_RANGES = {
    "24H": 1,
    "7D": 7,
    "1M": 30,
    "3M": 90,
    CUSTOM: null,
  } as const;

  useEffect(() => {
    const timeParams = get_time_frame_params(searchParams);
    const dateRange = {
      from: parseISO(timeParams.from),
      to: parseISO(timeParams.to),
    };

    setDate(dateRange);
    setTempDate(dateRange);

    if (onTimeFrameChange) {
      onTimeFrameChange(timeParams);
    }
  }, [searchParams, onTimeFrameChange]);

  const handleTimeframeChange = (range: keyof typeof TIME_RANGES) => {
    try {
      setActiveTab(range);
      const days = TIME_RANGES[range];

      if (days !== null) {
        const timeParams = getDateRangeFromDays(days);
        const queryString = createTimeFrameQueryString(timeParams);
        router.replace(`?${queryString}`, { scroll: false });

        if (onTimeFrameChange) {
          onTimeFrameChange(timeParams);
        }

        setDate({
          from: parseISO(timeParams.from),
          to: parseISO(timeParams.to),
        });

        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error changing timeframe:", error);
    }
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setTempDate(selectedDate);
  };

  const handleApplyDateRange = () => {
    try {
      if (tempDate?.from && tempDate?.to) {
        setDate(tempDate);
        const timeParams: TimeFrameParams = {
          from: startOfDay(tempDate.from).toISOString(),
          to: endOfDay(tempDate.to).toISOString(),
        };

        const queryString = createTimeFrameQueryString(timeParams);
        router.replace(`?${queryString}`, { scroll: false });

        if (onTimeFrameChange) {
          onTimeFrameChange(timeParams);
        }

        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error applying date range:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-blue-600 p-2 rounded-3xl">
      <div className="flex gap-1 bg-primary-700 rounded-md p-1">
        {(Object.keys(TIME_RANGES) as Array<keyof typeof TIME_RANGES>).map(
          (range) => (
            <button
              key={range}
              onClick={() => handleTimeframeChange(range)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-xl transition-colors",
                activeTab === range
                  ? "bg-white text-primary-700"
                  : "text-white hover:bg-primary-600/50"
              )}
            >
              {range}
            </button>
          )
        )}
      </div>

      {activeTab === "CUSTOM" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal rounded-2xl",
                !date && "text-muted-foreground"
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
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyDateRange}
                  disabled={!tempDate?.from || !tempDate?.to}
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
