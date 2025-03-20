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
import {
  endOfDay,
  format,
  parseISO,
  startOfDay,
  differenceInDays,
} from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  create_time_frame_query_string,
  get_time_frame_params,
  get_date_range_from_days,
} from "@/hooks/TimeFrame/api";
import { TimeFrameParams } from "@/types/timeframe";

interface TimeFrameProps {
  onTimeFrameChange?: (timeFrame: TimeFrameParams) => void;
}

const TimeFrame: React.FC<TimeFrameProps> = ({ onTimeFrameChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("24H");
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

  // Fungsi pembantu untuk menentukan tab yang aktif berdasarkan rentang tanggal
  const determineActiveTab = (
    fromDate: Date,
    toDate: Date
  ): keyof typeof TIME_RANGES => {
    // Deteksi 24H - jika dari awal hari hingga akhir hari yang sama
    const isSameDay =
      fromDate.getDate() === toDate.getDate() &&
      fromDate.getMonth() === toDate.getMonth() &&
      fromDate.getFullYear() === toDate.getFullYear();

    const isStartOfDay =
      fromDate.getHours() === 0 && fromDate.getMinutes() === 0;

    const isEndOfDay = toDate.getHours() === 23 && toDate.getMinutes() === 59;

    // Jika tanggal sama dan dari awal hari hingga akhir hari, itu adalah 24H
    if (isSameDay && isStartOfDay && isEndOfDay) {
      return "24H";
    }

    // Untuk timeframe lainnya, kita gunakan logika yang lebih fleksibel
    const daysDiff = differenceInDays(toDate, fromDate) + 1; // +1 karena inklusif

    if (daysDiff >= 6 && daysDiff <= 7) return "7D";
    if (daysDiff >= 28 && daysDiff <= 31) return "1M";
    if (daysDiff >= 89 && daysDiff <= 92) return "3M";

    return "CUSTOM";
  };

  // Effect pertama untuk menerapkan default timeframe saat pertama kali load
  useEffect(() => {
    if (!searchParams.has("from") && !searchParams.has("to")) {
      handleTimeframeChange("24H");
    }
  }, []);

  // Effect kedua untuk update komponen ketika URL berubah
  useEffect(() => {
    if (searchParams.has("from") && searchParams.has("to")) {
      const timeParams = get_time_frame_params(searchParams);
      const fromDate = parseISO(timeParams.from);
      const toDate = parseISO(timeParams.to);

      setDate({
        from: fromDate,
        to: toDate,
      });
      setTempDate({
        from: fromDate,
        to: toDate,
      });

      // Tentukan tab aktif berdasarkan rentang tanggal menggunakan fungsi pembantu
      const activeTimeframe = determineActiveTab(fromDate, toDate);
      setActiveTab(activeTimeframe);

      if (onTimeFrameChange) {
        onTimeFrameChange(timeParams);
      }
    }
  }, [searchParams, onTimeFrameChange]);

  const handleTimeframeChange = (range: keyof typeof TIME_RANGES) => {
    try {
      setActiveTab(range);
      const days = TIME_RANGES[range];

      if (days !== null) {
        const timeParams = get_date_range_from_days(days);
        const queryString = create_time_frame_query_string(timeParams);
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

        const queryString = create_time_frame_query_string(timeParams);
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
