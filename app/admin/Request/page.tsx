"use client";

import {
  Search,
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
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

// request data table
interface RequestData {
  createdAt: string;
  projectName: string;
  modelName: string;
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
  costUsage: string;
}



const Request = () => {
  return (
    <div className="p-6 pl-64 pt-20">
      {/* Header Controls */}
      <div className="flex sticky top-16 items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md  shadow-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search project"
            className="pl-10 bg-white/5 border-gray-700 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="date"
            className="bg-white/5 border-gray-700 focus:border-blue-600"
          />
        </div>
        <div className="flex absolute right-0 gap-2">
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

          <Button variant="secondary" className="border-gray-700 bg-white/5">
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          <Button variant="secondary" className="border-gray-700 bg-white/5 ">
            <SlidersHorizontal className="h-4 w-4 " />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg shadow-xl bg-white/5">
        <table className="w-full">
          <thead>
            <tr className="sticky top-28 border-b border-gray-700 bg-slate-500">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Project name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Model name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Completion Tokens
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Prompt Tokens
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Total Tokens
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-100">
                Cost usage
              </th>
            </tr>
          </thead>
          {/* Data table masih dummy ntar coba terapin jadi components di map per row*/}
          <tbody>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-slate/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFerro</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="border-b border-gray-700 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppDinal</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-sm">January 13 4:39 PM</td>
              <td className="px-4 py-3 text-sm">AppFaiq</td>
              <td className="px-4 py-3 text-sm">Gpt-4o</td>
              <td className="px-4 py-3 text-sm">40</td>
              <td className="px-4 py-3 text-sm">10</td>
              <td className="px-4 py-3 text-sm">50</td>
              <td className="px-4 py-3 text-sm">$0.0002828</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Request;
