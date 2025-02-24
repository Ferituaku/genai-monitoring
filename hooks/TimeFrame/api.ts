import { DateRange } from "react-day-picker";
import { addDays, startOfDay, endOfDay, subDays } from "date-fns";

export interface TimeFrameParams {
  from: string;
  to: string;
}

export const get_time_frame_params = (
  searchParams: URLSearchParams
): TimeFrameParams => {
  try {
    const now = new Date();
    const jakartaOffset = 7 * 60; // WIB offset in minutes
    const localOffset = now.getTimezoneOffset();
    const totalOffset = jakartaOffset + localOffset;

    const jakartaNow = new Date(now.getTime() + totalOffset * 60000);

    const defaultEndDate = endOfDay(jakartaNow);
    const defaultStartDate = startOfDay(subDays(jakartaNow, 7));
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new Error("invalid date");
      }
    }
    return {
      from: from || defaultStartDate.toISOString(),
      to: to || defaultEndDate.toISOString(),
    };
  } catch (error) {
    const now = new Date();
    const jakartaOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const totalOffset = jakartaOffset + localOffset;
    const jakartaNow = new Date(now.getTime() + totalOffset * 60000);

    return {
      from: startOfDay(subDays(jakartaNow, 7)).toISOString(),
      to: endOfDay(jakartaNow).toISOString(),
    };
  }
};

export const createTimeFrameQueryString = (params: TimeFrameParams): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("from", params.from);
  searchParams.set("to", params.to);
  return searchParams.toString();
};

// Helper function to get date range based on days back
export const getDateRangeFromDays = (daysBack: number): TimeFrameParams => {
  const now = new Date();
  const jakartaOffset = 7 * 60;
  const localOffset = now.getTimezoneOffset();
  const totalOffset = jakartaOffset + localOffset;
  const jakartaNow = new Date(now.getTime() + totalOffset * 60000);

  return {
    from: startOfDay(subDays(jakartaNow, daysBack)).toISOString(),
    to: endOfDay(now).toISOString(),
  };
};
