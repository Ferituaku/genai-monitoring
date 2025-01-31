'use client'

import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Clock,
  AlertCircle,
  Server,
  FileCode
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

interface ErrorTraceData {
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

const ExceptionRow = ({ data }: { data: ErrorTraceData }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const duration = `${(parseInt(data.Duration || "0") / 1_000_000_000).toFixed(2)}s`;

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
            {data.SpanName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[150px]">
            {data.StatusMessage || "Unknown Error"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {duration}
          </td>
        </tr>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Error Details</SheetTitle>
          <SheetDescription>
            Detailed information about this error
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Timestamp:</span>
            <span className="text-sm">{formatDate(data.Timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Service:</span>
            <span className="text-sm">{data.ServiceName}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Operation:</span>
            <span className="text-sm">{data.SpanName}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-500">Status:</span>
            <span className="text-sm text-red-500">ERROR</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Error Message</h3>
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <pre className="text-sm whitespace-pre-wrap text-red-500">
                {data.StatusMessage || "No error message available"}
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Trace Details</h3>
            <div className="bg-blue-600/10 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Trace ID:</div>
                <div>{data.TraceId}</div>
                <div className="text-gray-500">Span ID:</div>
                <div>{data.SpanId}</div>
                <div className="text-gray-500">Parent Span ID:</div>
                <div>{data.ParentSpanId || "None"}</div>
                <div className="text-gray-500">Duration:</div>
                <div>{duration}</div>
              </div>
            </div>
          </div>

          {Object.keys(data.SpanAttributes).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Attributes</h3>
              <div className="bg-blue-600/10 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(data.SpanAttributes).map(([key, value]) => (
                    <>
                      <div className="text-gray-500">{key}:</div>
                      <div>{value}</div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Exceptions = () => {
  const [traces, setTraces] = useState<ErrorTraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/traces/');
        if (!response.ok) {
          throw new Error('Failed to fetch traces');
        }
        const data = await response.json();
        setTraces(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, []);

  const filteredTraces = traces.filter(trace => 
    trace.ServiceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedTraces = filteredTraces.slice(0, parseInt(pageSize));

  if (loading) {
    return <div className="min-h-screen ml-64 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">{error}</div>;
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
                placeholder="Search service"
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
                  Size: <SelectValue />
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
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Error Message
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedTraces.map((trace, index) => (
                  <ExceptionRow 
                    key={`${trace.TraceId}-${index}`}
                    data={trace} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Exceptions;