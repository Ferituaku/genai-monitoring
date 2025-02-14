export const fetchExceptionTraces = async (timeFrameParams: {
  days?: string;
  from?: string;
  to?: string;
}) => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";
  let url = new URL(`${API_BASE_URL}/api/tracesExceptions/`);

  if (timeFrameParams.from && timeFrameParams.to) {
    url.searchParams.set("from", timeFrameParams.from);
    url.searchParams.set("to", timeFrameParams.to);
  } else if (timeFrameParams.days) {
    url.searchParams.set("days", timeFrameParams.days);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch traces");
  }
  return response.json();
};
