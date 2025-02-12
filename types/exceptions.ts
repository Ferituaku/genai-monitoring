export interface ErrorTraceData {
  Timestamp: string;
  TraceId: string;
  SpanId: string;
  ParentSpanId: string;
  ServiceName: string;
  SpanName: string;
  StatusCode: string;
  StatusMessage: string;
  SpanAttributes: Record<string, string>;
  Duration: string;
  "Events.Attributes": Array<Record<string, string>>;
}
export type SortField = "Timestamp";
export type SortDirection = "asc" | "desc";
