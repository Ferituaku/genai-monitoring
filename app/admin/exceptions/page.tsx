"use client";

import { useState, useEffect } from "react";
import { Search, ArrowUpDown, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { ErrorTraceData } from "@/types/exceptions";
import { SortDirection, SortField } from "@/types/trace";
import { get_time_frame_params } from "@/hooks/TimeFrame/api";
import { ExceptionApiService } from "@/lib/ExceptionService/api";
import TimeFrame from "@/components/TimeFrame/TimeFrame";
import ExceptionTable from "@/components/Exceptions/ExceptionTable";
import { Button } from "@/components/ui/button";

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ExceptionResponse {
  data: ErrorTraceData[];
  pagination: PaginationData;
}

const Exceptions = () => {
  const [traces, setTraces] = useState<ErrorTraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<string>("10");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("Timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  });

  const fetchData = async (searchValue = "", page = 1, size = parseInt(pageSize) || 10) => {
    try {
      setIsSearching(true);
      const timeFrameParams = get_time_frame_params(searchParams);
      const data = await ExceptionApiService.get_exception_trace(
        timeFrameParams,
        searchValue,
        page,
        size
      );
      if (data && data.data) {
        setTraces(data.data);
        setPagination(data.pagination);
      } else {
        // Handle older API response format
        setTraces(data || []);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTraces([]);
      setPagination({
        total: 0,
        page: 1,
        pageSize: parseInt(pageSize),
        totalPages: 1
      });
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Get current page from URL or default to 1
    const currentPage = parseInt(searchParams.get('page') || '1');
    const currentPageSize = parseInt(searchParams.get('page_size') || pageSize);
    setPageSize(currentPageSize.toString());
    
    const currentSearch = searchParams.get('app_name') || '';
    setSearchTerm(currentSearch);
    
    fetchData(currentSearch, currentPage, currentPageSize);
  }, [searchParams]);

  const handleSearch = () => {
    // Reset to page 1 when searching
    updateUrlParams(1, parseInt(pageSize));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateUrlParams(newPage, pagination.pageSize);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    // Reset to page 1 when changing page size
    updateUrlParams(1, parseInt(value));
  };

  const updateUrlParams = (page: number, pageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());
    
    if (searchTerm) {
      params.set('app_name', searchTerm);
    } else {
      params.delete('app_name');
    }
    
    router.push(`?${params.toString()}`);
  };

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
      <div className="sticky top-1 p-2 z-10">
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
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
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
              <Select value={pageSize} onValueChange={handlePageSizeChange}>
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
        <ExceptionTable
          displayedTraces={traces}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Exceptions;