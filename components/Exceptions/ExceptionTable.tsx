import React from 'react';
import { Card } from "@/components/ui/card";
import { ErrorTraceData } from "@/types/exceptions";
import ExceptionRow from "./ExceptionRow";
import Pagination from "@/components/Pagination/Pagination";

interface ExceptionTableProps {
  displayedTraces: ErrorTraceData[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export const ExceptionTable = ({
  displayedTraces,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: ExceptionTableProps) => {
  return (
    <Card className="rounded-md h-full flex flex-col ">
      <div className="sticky top-0 bg-gray-200 z-20">
        <table className="w-full">
          <thead>
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
        </table>
      </div>
      
      {/* Area scrollable */}
      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-300px)]">
        <table className="w-full">
          <tbody>
            {displayedTraces.length > 0 ? (
              displayedTraces.map((trace, index) => (
                <ExceptionRow key={`${trace.TraceId}-${index}`} data={trace} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No exception traces found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination area */}
      {onPageChange && totalPages && totalPages > 0 && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white z-20 px-6 py-2">
          <Pagination 
            currentPage={currentPage || 1}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems || displayedTraces.length}
            pageSize={pageSize || 10}
            compact={true} 
          />
        </div>
      )}
    </Card>
  );
};

export default ExceptionTable;