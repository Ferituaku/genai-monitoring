"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
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
import { useSearchParams } from "next/navigation";
import RequestRow from "./RequestRow/page";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

interface AppProject {
  serviceName: string;
  environment: string;
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  traces: TraceData[];
}
const Request = () => {
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

  const searchParams = useSearchParams();
  const days = searchParams.get("days") || "7";

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        setLoading(true);
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

  const groupedProjects = useMemo(() => {
    const projectMap = new Map<string, AppProject>();

    traces.forEach((trace) => {
      const projectKey = `${trace.ServiceName}-${trace.ResourceAttributes["deployment.environment"]}`;

      if (!projectMap.has(projectKey)) {
        projectMap.set(projectKey, {
          serviceName: trace.ServiceName,
          environment: trace.ResourceAttributes["deployment.environment"],
          totalRequests: 0,
          totalCost: 0,
          totalTokens: 0,
          traces: [],
        });
      }

      const project = projectMap.get(projectKey)!;
      project.totalRequests += 1;
      project.totalCost += parseFloat(
        trace.SpanAttributes["gen_ai.usage.cost"] || "0"
      );
      project.totalTokens += parseInt(
        trace.SpanAttributes["gen_ai.usage.total_tokens"] || "0"
      );
      project.traces.push(trace);
    });

    return Array.from(projectMap.values());
  }, [traces]);

  const filteredProjects = useMemo(() => {
    return groupedProjects.filter((project) =>
      project.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groupedProjects, searchTerm]);

  const toggleProjectExpansion = (projectKey: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectKey)) {
        newSet.delete(projectKey);
      } else {
        newSet.add(projectKey);
      }
      return newSet;
    });
  };

  const displayedTraces = filteredProjects.slice(0, parseInt(pageSize));

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
    <div className="max-h-full">
      <div className="sticky right-0 z-10 top-2">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex relative items-center gap-4">
              <TimeFrame />
            </div>
            <div className="relative flex min-w-[200px] items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search project"
                className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-20 bg-white rounded-lg shadow-sm">
        <Card className="rounded-lg">
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Total Requests
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Total Tokens
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-700">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-slate-700">
                    Details
                  </th>
                </tr>
              </thead>
            </table>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <tbody>
                  {filteredProjects.map((project) => {
                    const projectKey = `${project.serviceName}-${project.environment}`;
                    const isExpanded = expandedProjects.has(projectKey);

                    return (
                      <React.Fragment key={projectKey}>
                        <tr className="border-t border-gray-700 hover:bg-slate-400/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {project.serviceName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {project.environment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {project.totalRequests}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {project.totalTokens}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            ${project.totalCost.toFixed(10)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <Button
                              variant="ghost"
                              onClick={() => toggleProjectExpansion(projectKey)}
                              className="hover:bg-slate-200"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <div className="bg-gray-50 px-8 py-4">
                                {/* Expanded Table Container with Fixed Header */}
                                <div className="max-h-96 overflow-hidden">
                                  <table className="w-full">
                                    <thead className="sticky top-0 bg-slate-400 z-10">
                                      <tr className="border-b border-gray-300">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700">
                                          Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700">
                                          Model
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700">
                                          Completion Tokens
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700">
                                          Prompt Tokens
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700">
                                          Total Tokens
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700">
                                          Cost
                                        </th>
                                      </tr>
                                    </thead>
                                  </table>
                                  {/* Scrollable Body for Expanded Table */}
                                  <div className="max-h-80 overflow-y-auto">
                                    <table className="w-full">
                                      <tbody>
                                        {project.traces.map((trace, index) => (
                                          <RequestRow
                                            key={`${trace.TraceId}-${index}`}
                                            data={trace}
                                          />
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Request;
