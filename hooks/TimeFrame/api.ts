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
    // Gunakan UTC untuk konsistensi server-client
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );

    const defaultEndDate = endOfDay(utcDate);
    const defaultStartDate = startOfDay(utcDate, 1);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      // Parse dates in UTC
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new Error("invalid date");
      }

      return {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      };
    }

    return {
      from: defaultStartDate.toISOString(),
      to: defaultEndDate.toISOString(),
    };
  } catch (error) {
    // Fallback dengan UTC dates
    const now = new Date();
    const utcNow = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );

    return {
      from: startOfDay(utcNow).toISOString(),
      to: endOfDay(utcNow).toISOString(),
    };
  }
};

export const create_time_frame_query_string = (
  params: TimeFrameParams
): string => {
  const searchParams = new URLSearchParams();
  searchParams.set("from", params.from);
  searchParams.set("to", params.to);
  return searchParams.toString();
};

// Helper function to get date range based on days back
export const get_date_range_from_days = (daysBack: number): TimeFrameParams => {
  const now = new Date();
  const jakartaOffset = 7 * 60;
  const localOffset = now.getTimezoneOffset();
  const totalOffset = jakartaOffset + localOffset;
  const jakartaNow = new Date(now.getTime() + totalOffset * 60000);

  if (daysBack === 1) {
    return {
      from: startOfDay(jakartaNow).toISOString(),
      to: endOfDay(jakartaNow).toISOString(),
    };
  }

  return {
    from: startOfDay(subDays(jakartaNow, daysBack - 1)).toISOString(),
    to: endOfDay(jakartaNow).toISOString(),
  };
};
