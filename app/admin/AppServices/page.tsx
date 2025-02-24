"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import TimeFrame from "@/components/TimeFrame/TimeFrame";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/ChatService/api";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { get_time_frame_params } from "@/hooks/TimeFrame/api";

interface ChatSession {
  UniqueIDChat: string;
  Timestamp: string;
  TotalMessages: number;
}

interface ProjectChat {
  serviceName: string;
  environment: string;
  totalRequests: number;
  chatSessions: ChatSession[];
}

const Request = () => {
  const [PROJECTS, SET_PROJECTS] = useState<ProjectChat[]>([]);
  const [LOADING, SET_LOADING] = useState(true);
  const [SEARCH_TERM, SET_SEARCH_TERM] = useState("");
  const [EXPANDED_PROJECTS, SET_EXPANDED_PROJECTS] = useState<Set<string>>(
    new Set()
  );
  const [ERROR, SET_ERROR] = useState<string | null>(null);
  const ROUTER = useRouter();
  const { toast } = useToast();

  const SEARCH_PARAMS = useSearchParams();
  const TIME_FRAME_PARAMS = get_time_frame_params(SEARCH_PARAMS);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        SET_LOADING(true);
        const DATA = await ApiService.get_project_chats(TIME_FRAME_PARAMS);
        SET_PROJECTS(DATA);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch projects. Please try again later.",
        });
      } finally {
        SET_LOADING(false);
      }
    };

    fetchProjects();
  }, [toast, SEARCH_PARAMS]);

  const FILTERED_PROJECTS = useMemo(() => {
    return PROJECTS.filter((project) =>
      project.serviceName.toLowerCase().includes(SEARCH_TERM.toLowerCase())
    );
  }, [PROJECTS, SEARCH_TERM]);

  const TOGGLE_PROJECTS_EXPANSION = (projectKey: string) => {
    SET_EXPANDED_PROJECTS((prev) => {
      const NEW_SET = new Set(prev);
      if (NEW_SET.has(projectKey)) {
        NEW_SET.delete(projectKey);
      } else {
        NEW_SET.add(projectKey);
      }
      return NEW_SET;
    });
  };

  const NAVIGATE_TO_CHAT_SESSION = (uniqueIdChat: string) => {
    ROUTER.push(`/admin/AppServices/ChatHistory/${uniqueIdChat}`);
  };

  if (LOADING) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (ERROR) {
    return (
      <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">
        {ERROR}
      </div>
    );
  }

  return (
    <div className="max-h-screen ">
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
      <div className="sticky right-0 z-10 top-2">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex flex-col gap-[540px] sm:flex-row">
            <div className="flex relative items-center gap-4">
              <TimeFrame />
            </div>
            <div className="relative flex w-[380px] min-w-[200px] items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search project"
                className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
                value={SEARCH_TERM}
                onChange={(e) => SET_SEARCH_TERM(e.target.value)}
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
                    Total Chat Sessions
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-slate-700">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {FILTERED_PROJECTS.map((project) => {
                  const PROJECT_KEY = `${project.serviceName}-${project.environment}`;
                  const IS_FRAGMENT = EXPANDED_PROJECTS.has(PROJECT_KEY);

                  return (
                    <React.Fragment key={PROJECT_KEY}>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <Button
                            variant="outline"
                            onClick={() =>
                              TOGGLE_PROJECTS_EXPANSION(PROJECT_KEY)
                            }
                            className="hover:bg-primary"
                          >
                            {IS_FRAGMENT ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                      {IS_FRAGMENT && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <div className="bg-gray-50 px-8 py-4">
                              <table className="w-full">
                                <thead className="bg-slate-200">
                                  <tr className="border-b border-gray-300">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700">
                                      Chat Session ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700">
                                      Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-700">
                                      Total Messages
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-700">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {project.chatSessions.map((session) => (
                                    <tr
                                      key={session.UniqueIDChat}
                                      className="hover:bg-slate-100 transition-colors"
                                    >
                                      <td className="px-6 py-3 text-sm">
                                        {session.UniqueIDChat}
                                      </td>
                                      <td className="px-6 py-3 text-sm">
                                        {new Date(
                                          session.Timestamp
                                        ).toLocaleString()}
                                      </td>
                                      <td className="px-6 py-3 text-sm text-right">
                                        {session.TotalMessages}
                                      </td>
                                      <td className="px-6 py-3 text-center">
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            NAVIGATE_TO_CHAT_SESSION(
                                              session.UniqueIDChat
                                            )
                                          }
                                          className="hover:bg-primary"
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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
        </Card>
      </div>
    </div>
  );
};

export default Request;
