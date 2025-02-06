"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import RequestRow from "./RequestRow/page";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DynamicBreadcrumb from "@/components/Breadcrum";

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

type SortField =
  | "Timestamp"
  | "SpanAttributes.gen_ai.request.model"
  | "SpanAttributes.gen_ai.usage.total_tokens"
  | "SpanAttributes.gen_ai.usage.cost";
type SortDirection = "asc" | "desc";

const Request = () => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  //  advanced filtering and sorting
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    []
  );
  const [sortField, setSortField] = useState<string>("Timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  //  searchable filters
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [environmentSearchTerm, setEnvironmentSearchTerm] = useState("");

  const searchParams = useSearchParams();
  const days = searchParams?.get("days") || "7"; //buat handle time frame show data

  useEffect(() => {
    const fetchTraces = async () => {
      try {
          
        const response = await fetch(
          `http://localhost:5000/api/tracesRequest/?days=${days}`
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

  const uniqueModels = useMemo(
    () => [
      ...new Set(
        traces
          .map((trace) => trace.SpanAttributes["gen_ai.request.model"])
          .filter((model): model is string => model !== undefined)
      ),
    ],
    [traces]
  );

  const uniqueEnvironments = useMemo(
    () => [
      ...new Set(
        traces
          .map((trace) => trace.ResourceAttributes["deployment.environment"])
          .filter((env): env is string => env !== undefined)
      ),
    ],
    [traces]
  );

  const filteredUniqueModels = useMemo(
    () =>
      uniqueModels.filter((model) =>
        model.toLowerCase().includes(modelSearchTerm.toLowerCase())
      ),
    [uniqueModels, modelSearchTerm]
  );

  const filteredUniqueEnvironments = useMemo(
    () =>
      uniqueEnvironments.filter((env) =>
        env.toLowerCase().includes(environmentSearchTerm.toLowerCase())
      ),
    [uniqueEnvironments, environmentSearchTerm]
  );

  const filteredTraces = useMemo(() => {
    return traces.filter((trace) => {
      // Safely get model and environment
      const model = trace.SpanAttributes["gen_ai.request.model"] || "";
      const environment =
        trace.ResourceAttributes["deployment.environment"] || "";

      // Service Name search
      const matchesSearchTerm = trace.ServiceName.toLowerCase().includes(
        searchTerm.toLowerCase()
      );

      // Model filter
      const matchesModel =
        selectedModels.length === 0 || selectedModels.includes(model);

      // Environment filter
      const matchesEnvironment =
        selectedEnvironments.length === 0 ||
        selectedEnvironments.includes(environment);

      return matchesSearchTerm && matchesModel && matchesEnvironment;
    });
  }, [traces, searchTerm, selectedModels, selectedEnvironments]);

  const sortedTraces = useMemo(() => {
    return [...filteredTraces].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortField) {
        case "Timestamp":
          valueA = new Date(a.Timestamp).getTime();
          valueB = new Date(b.Timestamp).getTime();
          break;
        case "SpanAttributes.gen_ai.request.model":
          valueA = a.SpanAttributes["gen_ai.request.model"];
          valueB = b.SpanAttributes["gen_ai.request.model"];
          break;
        case "SpanAttributes.gen_ai.usage.total_tokens":
          valueA = parseInt(
            a.SpanAttributes["gen_ai.usage.total_tokens"] || "0"
          );
          valueB = parseInt(
            b.SpanAttributes["gen_ai.usage.total_tokens"] || "0"
          );
          break;
        case "SpanAttributes.gen_ai.usage.cost":
          valueA = parseFloat(a.SpanAttributes["gen_ai.usage.cost"] || "0");
          valueB = parseFloat(b.SpanAttributes["gen_ai.usage.cost"] || "0");
          break;
        default:
          valueA = a.Timestamp;
          valueB = b.Timestamp;
      }

      // Comparison logic with sort direction
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTraces, sortField, sortDirection]);

  const displayedTraces = sortedTraces.slice(0, parseInt(pageSize));

  // Reset filters function
  const resetFilters = () => {
    setSelectedModels([]);
    setSelectedEnvironments([]);
    setSearchTerm("");
    setSortField("Timestamp");
    setSortDirection("desc");
  };

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
      <div className="fixed top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>
      <div className="sticky right-0 z-10 top-2">
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
                <SelectItem value="SpanAttributes.gen_ai.request.model-asc">
                  Model (A-Z)
                </SelectItem>
                <SelectItem value="SpanAttributes.gen_ai.usage.total_tokens-desc">
                  Highest Tokens
                </SelectItem>
                <SelectItem value="SpanAttributes.gen_ai.usage.cost-desc">
                  Highest Cost
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Filter Button */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="secondary"
                  className="border-gray-700 shadow-md bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4 text-white" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Filter by Model</h4>
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search models"
                        className="pl-8 w-full"
                        value={modelSearchTerm}
                        onChange={(e) => setModelSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredUniqueModels.length > 0 ? (
                        filteredUniqueModels.map((model) => (
                          <div
                            key={model}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Checkbox
                              id={`model-${model}`}
                              checked={selectedModels.includes(model)}
                              onCheckedChange={(checked) => {
                                setSelectedModels((prev) =>
                                  checked
                                    ? [...prev, model]
                                    : prev.filter((m) => m !== model)
                                );
                              }}
                            />
                            <Label htmlFor={`model-${model}`}>{model}</Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          No models found
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Environment Filter with Search */}
                  <div>
                    <h4 className="font-medium mb-2">Filter by Environment</h4>
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search environments"
                        className="pl-8 w-full"
                        value={environmentSearchTerm}
                        onChange={(e) =>
                          setEnvironmentSearchTerm(e.target.value)
                        }
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredUniqueEnvironments.length > 0 ? (
                        filteredUniqueEnvironments.map((env) => (
                          <div
                            key={env}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <Checkbox
                              id={`env-${env}`}
                              checked={selectedEnvironments.includes(env)}
                              onCheckedChange={(checked) => {
                                setSelectedEnvironments((prev) =>
                                  checked
                                    ? [...prev, env]
                                    : prev.filter((e) => e !== env)
                                );
                              }}
                            />
                            <Label htmlFor={`env-${env}`}>{env}</Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          No environments found
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" /> Reset Filters
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
