export interface TraceData {
  Timestamp: string;
  TraceId: string;
  SpanId: string;
  ParentSpanId: string;
  TraceState: string;
  ServiceName: string;
  SpanName: string;
  SpanKind: string;
  ScopeName: string;
  ScopeVersion: string;
  StatusCode: string;
  StatusMessage: string;
  SpanAttributes: {
    "gen_ai.request.model": string;
    "gen_ai.usage.output_tokens": string;
    "gen_ai.usage.input_tokens": string;
    "gen_ai.usage.total_tokens": string;
    "gen_ai.usage.cost": string;
    "gen_ai.operation.name": string;
    "gen_ai.endpoint": string;
    [key: string]: string;
  };
  ResourceAttributes: {
    "deployment.environment": string;
    "telemetry.sdk.version": string;
    "service.name": string;
    "telemetry.sdk.language": string;
    "telemetry.sdk.name": string;
  };
  Duration: string;
  "Events.Attributes": Array<{
    "gen_ai.prompt"?: string;
    "gen_ai.completion"?: string;
  }>;
  "Events.Name": string[];
  "Events.Timestamp": string[];
  "Links.TraceId": string[];
  "Links.SpanId": string[];
  "Links.TraceState": string[];
  "Links.Attributes": any[];
}

export type SortField =
  | "Timestamp"
  | "SpanAttributes.gen_ai.request.model"
  | "SpanAttributes.gen_ai.usage.total_tokens"
  | "SpanAttributes.gen_ai.usage.cost";

export type SortDirection = "asc" | "desc";


