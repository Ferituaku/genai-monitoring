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

interface RequestData {
  timestamp: string;
  trace_id: string;
  app_name: string;
  operation_name: string;
  attributes: {
    completion_tokens?: number;
    prompt_tokens?: number;
    total_tokens?: number;
    cost?: string;
    model?: string;
    prompt?: string;
    completion?: string;
    duration?: string;
  };
  additional_info: {
    
  }
}

const RequestRow = ({ data }: { data: RequestData }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const modelName = data.attributes?.model || "";
  const completionTokens = data.attributes?.completion_tokens || 0;
  const promptTokens = data.attributes?.prompt_tokens || 0;
  const totalTokens = data.attributes?.total_tokens || 0;
  const costUsage = data.attributes?.cost || "$0.00";
  const duration = data.attributes?.duration || "0s";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <tr className="border-b border-gray-700 hover:bg-slate-400/10 transition-colors cursor-pointer">
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {formatDate(data.timestamp)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[150px]">
            {data.app_name}
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
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Request Details</SheetTitle>
          <SheetDescription>
            Detailed information about this request
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Created:</span>
            <span className="text-sm">{formatDate(data.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Cost:</span>
            <span className="text-sm">{costUsage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Model:</span>
            <span className="text-sm">{modelName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Duration:</span>
            <span className="text-sm">{duration}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Token Usage</h3>
          <div className="grid grid-cols-3 gap-4 bg-blue-600/70 p-3 rounded-lg">
            <div>
              <div className="text-xs text-gray-700">Prompt</div>
              <div className="text-sm font-medium">{promptTokens}</div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Completion</div>
              <div className="text-sm font-medium">{completionTokens}</div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Total</div>
              <div className="text-sm font-medium">{totalTokens}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Prompt</h3>
            <div className="bg-blue-600/70 p-3 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">
                {data.attributes?.prompt || "No prompt available"}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Completion</h3>
            <div className="bg-blue-600/70 p-3 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">
                {data.attributes?.completion || "No completion available"}
              </pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Request = () => {
  const [traces, setTraces] = useState<RequestData[]>([]);
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
    trace.app_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedTraces = filteredTraces.slice(0, parseInt(pageSize));

  if (loading) {
    return <div className="min-h-screen ml-64 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen ml-64 flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen ml-64">
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
                  <RequestRow 
                    key={`${trace.trace_id}-${index}`} // Menambahkan index untuk memastikan keunikan
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

export default Request;