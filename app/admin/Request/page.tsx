"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  MessageSquare,
  Clock,
  Coins,
  Tags,
  Braces,
  AlarmClock,
  Ticket,
  Boxes,
  Container,
  ClipboardType,
  DoorClosed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TimeFrame from "@/components/TimeFrame";

interface TraceData {
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

const RequestRow = ({ data }: { data: TraceData }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const modelName = data.SpanAttributes?.["gen_ai.request.model"] || "";
  const completionTokens = parseInt(
    data.SpanAttributes?.["gen_ai.usage.output_tokens"] || "0"
  );
  const promptTokens = parseInt(
    data.SpanAttributes?.["gen_ai.usage.input_tokens"] || "0"
  );
  const totalTokens = parseInt(
    data.SpanAttributes?.["gen_ai.usage.total_tokens"] || "0"
  );
  const costUsage = `$${parseFloat(
    data.SpanAttributes?.["gen_ai.usage.cost"] || "0"
  ).toFixed(10)}`;
  const duration = `${(parseInt(data.Duration || "0") / 1_000_000_000).toFixed(
    2
  )}s`; // Convert nanoseconds to seconds
  const environment = data.ResourceAttributes["deployment.environment"] || "";
  const type = data.SpanAttributes["gen_ai.operation.name"] || "";
  const endpoint = data.SpanAttributes["gen_ai.endpoint"] || "";

  // Find prompt and completion from Events.Attributes (masih tidak kebaca sebagai output, prompt dan response stringnya)
  const prompt =
    data["Events.Attributes"]?.find((attr) => "gen_ai.prompt" in attr)?.[
      "gen_ai.prompt"
    ] || "";
  const completion =
    data["Events.Attributes"]?.find((attr) => "gen_ai.completion" in attr)?.[
      "gen_ai.completion"
    ] || "";
  const formatTraceData = () => {
    const root = {
      root: {
        Timestamp: data.Timestamp,
        TraceId: data.TraceId,
        SpanId: data.SpanId,
        ParentSpanId: data.ParentSpanId,
        TraceState: data.TraceState,
        SpanName: data.SpanName,
        SpanKind: data.SpanKind,
        ServiceName: data.ServiceName,
        ResourceAttributes: data.ResourceAttributes,
        ScopeName: data.ScopeName,
        ScopeVersion: data.ScopeVersion,
        SpanAttributes: data.SpanAttributes,
        Duration: data.Duration,
        StatusCode: data.StatusCode,
        StatusMessage: data.StatusMessage,
        "Events.Timestamp": data["Events.Timestamp"],
        "Events.Name": data["Events.Name"],
        "Events.Attributes": data["Events.Attributes"],
        "Links.TraceId": data["Links.TraceId"],
        "Links.SpanId": data["Links.SpanId"],
        "Links.TraceState": data["Links.TraceState"],
        "Links.Attributes": data["Links.Attributes"],
      },
    };

    return JSON.stringify(root, null, 2);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <tr className="border-b border-gray-700 hover:bg-slate-400/10 transition-colors cursor-pointer">
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {formatDate(data.Timestamp)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[150px]">
            {data.ServiceName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {modelName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[150px]">
            {completionTokens}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {promptTokens}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {totalTokens}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {costUsage}
          </td>
        </tr>
      </SheetTrigger>
      <SheetContent className="w-full max-w-4xl sm:w-[55vw] lg:w-[50vw] resize overflow-y-scroll">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-sm sm:text-xs font-bold">
            Request Details
          </SheetTitle>
          <SheetDescription>
            Detailed information about this request
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-start flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Clock className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Created:</span>
            <span className="text-sm text-white sm:text-xs">
              {formatDate(data.Timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Coins className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Cost:</span>
            <span className="text-sm text-white sm:text-xs">{costUsage}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Boxes className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Model:</span>
            <span className="text-sm text-white sm:text-xs">{modelName}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <AlarmClock className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">
              Request Duration:
            </span>
            <span className="text-sm text-white sm:text-xs">{duration}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Braces className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Promt Token:</span>
            <span className="text-sm text-white sm:text-xs">
              {promptTokens}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Ticket className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Total Token:</span>
            <span className="text-sm text-white sm:text-xs">{totalTokens}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <MessageSquare className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Completion:</span>
            <span className="text-sm text-white sm:text-xs">
              {completionTokens}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Container className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Environment:</span>
            <span className="text-sm text-white sm:text-xs">{environment}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <ClipboardType className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Type:</span>
            <span className="text-sm text-white sm:text-xs">{type}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <DoorClosed className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-sm text-white sm:text-xs">Endpoint:</span>
            <span className="text-sm text-white sm:text-xs">{endpoint}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Prompt</h3>
            <div className="bg-black p-3 rounded-md">
              <pre className="text-sm text-white whitespace-pre-wrap">
                {prompt || "No prompt available"}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Response</h3>
            <div className="bg-black p-3 rounded-lg">
              <pre className="text-sm text-white whitespace-pre-wrap">
                {completion || "No response available"}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Trace</h3>
            <div className="bg-black p-3 max-h-screen rounded-lg overflow-y-scroll">
              <pre className="text-sm text-white whitespace-pre-wrap">
                {formatTraceData()}
              </pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Request = () => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/tracesRequest/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch traces");
        }
        const data = await response.json();
        setTraces(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, []);

  const filteredTraces = traces.filter((trace) =>
    trace.ServiceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedTraces = filteredTraces.slice(0, parseInt(pageSize));

  if (loading) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-2 right-0 z-10 pt-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex relative items-center gap-4">
              <TimeFrame />
            </div>
            <div className="relative flex min-w-[200px] items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari proyek"
                className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end items-center">
            <Select value={pageSize} onValueChange={setPageSize}>
              <SelectTrigger className="w-28 bg-blue-600 hover:bg-blue-700 text-white border-0">
                <span className="flex items-center gap-2">
                  Ukuran: <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              className="border-gray-700 hover:bg-slate-400/10 transition-colors bg-white/5"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="border-gray-700 hover:bg-slate-400/10 transition-colors bg-white/5"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky top-20 bg-white rounded-lg shadow-sm">
        <Card className="rounded-md">
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Waktu Dibuat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Nama Proyek
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Nama Model
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Token Completion
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Token Prompt
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Total Token
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Biaya
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedTraces.map((trace, index) => (
                  <RequestRow key={`${trace.TraceId}-${index}`} data={trace} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Request;
