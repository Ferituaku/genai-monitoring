"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import TimeFrame from "@/components/TimeFrame";

interface ChatSession {
  UniqueIDChat: string;
  Timestamp: string;
  ServiceName: string;
  Environment: string;
  TotalMessages: number;
}

interface AppProject {
  serviceName: string;
  environment: string;
  totalRequests: number;
  chatSessions: ChatSession[];
}

const Request = () => {
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch projects with their chat sessions
        const response = await fetch(`http://localhost:5000/api/projectchat`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

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

  const navigateToChatSession = (uniqueIdChat: string) => {
    router.push(`/admin/AppServices/ChatHistory/${uniqueIdChat}`);
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
              d="M100 50.5908C100 50.5908 77.6142 73.2051 50 73.2051C22.3858 73.2051 0 50.5908 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
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
                    Total Chat Sessions
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-slate-700">
                    Details
                  </th>
                </tr>
              </thead>
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
                          {project.chatSessions?.length ?? 0}
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
                                  {(project.chatSessions ?? []).map(
                                    (session) => (
                                      <tr
                                        key={session.UniqueIDChat}
                                        className="hover:bg-slate-100 transition-colors"
                                      >
                                        <td className="px-6 py-3 text-sm">
                                          {session.UniqueIDChat}
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                          {session.Timestamp}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right">
                                          {session.TotalMessages}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                          <Button
                                            variant="ghost"
                                            onClick={() =>
                                              navigateToChatSession(
                                                session.UniqueIDChat
                                              )
                                            }
                                            className="hover:bg-slate-200"
                                          >
                                            <MessageCircle className="h-4 w-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    )
                                  )}
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
