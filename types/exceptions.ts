export interface ErrorTraceData {
  Timestamp: string;
  TraceId: string;
  SpanId: string;
  ParentSpanId: string;
  TraceState: string;
  SpanName: string;
  SpanKind: string;
  ServiceName: string;
  ResourceAttributes: Record<string, any>;
  ScopeName: string;
  ScopeVersion: string;
  SpanAttributes: Record<string, any>;
  Duration: string;
  StatusCode: string;
  StatusMessage: string;
  'Events.Timestamp': string[];
  'Events.Name': string[];
  'Events.Attributes': any[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
export type SortField = "Timestamp";
export type SortDirection = "asc" | "desc";
