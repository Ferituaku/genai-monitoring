"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { ErrorTraceData } from "@/types/exceptions";
import { SortDirection, SortField } from "@/types/trace";
import { get_time_frame_params } from "@/hooks/TimeFrame/api";
import { ExceptionApiService } from "@/lib/ExceptionService/api";
import TimeFrame from "@/components/TimeFrame/TimeFrame";
import ExceptionRow from "@/components/Exceptions/ExceptionRow";
import { Button } from "@/components/ui/button";

const Exceptions = () => {
  const [traces, setTraces] = useState<ErrorTraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState<SortField>("Timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async (searchValue = "") => {
    try {
      setIsSearching(true);
      const timeFrameParams = get_time_frame_params(searchParams);
      const data = await ExceptionApiService.get_exception_trace(
        timeFrameParams,
        searchValue
      );
      setTraces(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, [searchParams]);

  const handleSearch = () => {
    fetchData(searchTerm);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // const filteredTraces = useMemo(() => {
  //   return traces.filter((trace) =>
  //     trace.ServiceName?.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [traces, searchTerm]);

  const sortedTraces = useMemo(() => {
    return [...traces].sort((a, b) => {
      const timestampA = new Date(a.Timestamp).getTime();
      const timestampB = new Date(b.Timestamp).getTime();

      return sortDirection === "asc"
        ? timestampA - timestampB
        : timestampB - timestampA;
    });
  }, [traces, sortDirection]);

  const displayedTraces = sortedTraces.slice(0, parseInt(pageSize));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
    <div className="h-full overflow-y-clip">
      <div className="sticky top-1 p-2">
        <DynamicBreadcrumb />
        <div className="pt-4">
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
                  onKeyUp={handleKeyPress}
                />
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Search"
                  )}
                </Button>
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
      </div>

      <div className="sticky top-20 bg-white rounded-lg shadow-sm">
        <Card className="rounded-md h-full flex flex-col">
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
