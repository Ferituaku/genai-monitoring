"use client";

import { useState } from "react";
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

interface RequestData {
  id: string;
  createdAt: string;
  projectName: string;
  modelName: string;
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
  costUsage: string;
  prompt: string;
  completion: string;
  duration: string;
  status: string;
}

// Sample data with additional details
const RequestDataContent: RequestData[] = [
  {
    id: "1",
    createdAt: "January 13 4:39 PM",
    projectName: "AppFerro",
    modelName: "GPT-4",
    completionTokens: 40,
    promptTokens: 10,
    totalTokens: 50,
    costUsage: "$0.0002828",
    prompt: "What is the best way to implement authentication in Next.js?",
    completion:
      "There are several approaches to implementing authentication in Next.js...",
    duration: "2.3s",
    status: "completed",
  },
  {
    id: "2",
    createdAt: "January 13 4:39 PM",
    projectName: "AppDinal",
    modelName: "Astra-OpenAi-3.5",
    completionTokens: 40,
    promptTokens: 10,
    totalTokens: 50,
    costUsage: "$0.0002828",
    prompt: "Siapa nama bapak kau?",
    completion: "Tidak tahu, tapi yang jelas bukan NurCholis",
    duration: "2.3s",
    status: "completed",
  },
];

const RequestRow = ({ data }: { data: RequestData }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <tr className="border-b border-gray-700 hover:bg-slate-400/10 transition-colors cursor-pointer">
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {data.createdAt}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[150px]">
            {data.projectName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {data.modelName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[150px]">
            {data.completionTokens}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {data.promptTokens}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {data.totalTokens}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {data.costUsage}
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

        {/* Request Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Created:</span>
            <span className="text-sm">{data.createdAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Cost:</span>
            <span className="text-sm">{data.costUsage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Model:</span>
            <span className="text-sm">{data.modelName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Duration:</span>
            <span className="text-sm">{data.duration}</span>
          </div>
        </div>

        {/* Token Usage */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Token Usage</h3>
          <div className="grid grid-cols-3 gap-4 bg-blue-600/70 p-3 rounded-lg">
            <div>
              <div className="text-xs text-gray-700">Prompt</div>
              <div className="text-sm font-medium">{data.promptTokens}</div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Completion</div>
              <div className="text-sm font-medium">{data.completionTokens}</div>
            </div>
            <div>
              <div className="text-xs text-gray-700">Total</div>
              <div className="text-sm font-medium">{data.totalTokens}</div>
            </div>
          </div>
        </div>

        {/* Prompt & Completion */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Prompt</h3>
            <div className="bg-blue-600/70 p-3 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{data.prompt}</pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Completion</h3>
            <div className="bg-blue-600/70 p-3 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">
                {data.completion}
              </pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Request = () => {
  return (
    <div className="p-6 pl-64 pt-2">
      <div className="flex flex-col lg:flex-row gap-4 mb-2 ">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search project"
              className="pl-10 bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
            />
          </div>
          <div className="flex relative items-center gap-4">
            <Input
              type="date"
              className="bg-white/5 border-gray-700 hover:bg-slate-400/10 transition-colors focus:border-blue-600"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Select defaultValue="10">
            <SelectTrigger className="w-24 bg-blue-600 hover:bg-blue-700 text-white border-0">
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

      {/* Table */}
      <div className="shadow-xl bg-white/5">
        <table className="w-full ">
          <thead>
            <tr className="sticky top-2  border-b border-gray-500 bg-slate-300">
              <th className="px-4 py-3 text-left border-r border-gray-500 text-sm font-medium text-gray-500">
                Created At
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-500 text-sm font-medium text-gray-500">
                Project name
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-500 text-sm font-medium text-gray-500">
                Model name
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-500 text-sm font-medium text-gray-500">
                Completion Tokens
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-500 text-sm font-medium text-gray-500">
                Prompt Tokens
              </th>
              <th className="px-4 py-3 text-left border-r border-gray-500 text-sm font-medium text-gray-500">
                Total Tokens
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Cost usage
              </th>
            </tr>
          </thead>
          <tbody>
            {RequestDataContent.map((row) => (
              <RequestRow key={row.id} data={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Request;
