import { TimeFrameParams } from "@/types/timeframe";

export const getTimeFrameParams = (
  searchParams: URLSearchParams
): TimeFrameParams => {
  const days = searchParams.get("days");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (from && to) {
    return { from, to };
  }

  return { days: days || "7" }; // Default to 7 days if no params
};

export const createTimeFrameQueryString = (
  timeParams: TimeFrameParams
): string => {
  const queryParams = new URLSearchParams();

  if (timeParams.from && timeParams.to) {
    queryParams.set("from", timeParams.from);
    queryParams.set("to", timeParams.to);
  } else if (timeParams.days) {
    queryParams.set("days", timeParams.days);
  }

  return queryParams.toString();
};
