import { TimeFrameParams } from "@/types/timeframe";

export const get_time_frame_params = (
  searchParams: URLSearchParams
): TimeFrameParams => {
  const days = searchParams.get("days");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (from && to) {
    return { from, to };
  }

  return { days: days || "7" };
};

export const create_time_frame_query_string = (
  timeParams: TimeFrameParams
): string => {
  const QUERY_PARAMS = new URLSearchParams();

  if (timeParams.from && timeParams.to) {
    QUERY_PARAMS.set("from", timeParams.from);
    QUERY_PARAMS.set("to", timeParams.to);
  } else if (timeParams.days) {
    QUERY_PARAMS.set("days", timeParams.days);
  }

  return QUERY_PARAMS.toString();
};
