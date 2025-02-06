"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Clock,
  AlertCircle,
  Server,
  FileCode,
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

import { Card } from "@/components/ui/card";
import TimeFrame from "@/components/TimeFrame";
import ExceptionRow from "./ExeptionRow/page";
import { useSearchParams } from "next/navigation";
import DynamicBreadcrumb from "@/components/Breadcrum";

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
type SortField = "Timestamp";
type SortDirection = "asc" | "desc";

const Exceptions = () => {
  const [traces, setTraces] = useState<ErrorTraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const days = searchParams.get("days") || "7"; //buat handle time frame show data
  const [sortField, setSortField] = useState<SortField>("Timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/tracesExceptions/?days=${days}`
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
  }, [days]);

  const filteredTraces = useMemo(() => {
    return traces.filter((trace) =>
      trace.ServiceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [traces, searchTerm]);

  const sortedTraces = useMemo(() => {
    return [...filteredTraces].sort((a, b) => {
      const timestampA = new Date(a.Timestamp).getTime();
      const timestampB = new Date(b.Timestamp).getTime();

      return sortDirection === "asc"
        ? timestampA - timestampB
        : timestampB - timestampA;
    });
  }, [filteredTraces, sortDirection]);

  const displayedTraces = sortedTraces.slice(0, parseInt(pageSize));

  if (loading) {
    return (
      <div className="text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
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
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
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
            {/* Page Size Button */}
            <Select value={pageSize} onValueChange={setPageSize}>
              <SelectTrigger className="w-32 bg-blue-600 hover:bg-blue-700 text-white border-0">
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
            {/* Sorting Button */}
            <Select
              value={`${sortField}-${sortDirection}`}
              onValueChange={(value) => {
                const [field, direction] = value.split("-") as [
                  SortField,
                  SortDirection
                ];
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger className="w-20 bg-blue-600 hover:bg-blue-700 text-white border-0">
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Timestamp-desc">Newest First</SelectItem>
                <SelectItem value="Timestamp-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="sticky top-20 bg-white rounded-lg shadow-sm">
        <Card className="rounded-md">
          <div className="max-h-[calc(100vh-180px)] overflow-y-scroll">
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
                    Exception Type
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
