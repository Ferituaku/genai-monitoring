import { Clock, AlertCircle, Server, FileCode } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ErrorTraceData } from "@/types/exceptions";

const ExceptionRow = ({ data }: { data: ErrorTraceData }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const duration = `${(parseInt(data.Duration || "0") / 1_000_000_000).toFixed(
    2
  )}s`;
  const exception = data["Events.Attributes"].find(
    (event) => event["exception.type"]
  );
  const exceptionType = exception
    ? exception["exception.type"]
    : "Unknown Exception";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <tr className="border-b border-gray-700 hover:bg-slate-400/10 transition-colors cursor-pointer sm:overflow-x-auto">
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {formatDate(data.Timestamp)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[150px]">
            {data.ServiceName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {data.SpanName}
          </td>
          <td className="px-6 py-4 whitespace-normal text-sm w-[150px] break-words text-ellipsis">
            {exceptionType}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
            {duration}
          </td>
        </tr>
      </SheetTrigger>
      <SheetContent className="w-full max-w-4xl sm:w-[55vw] lg:w-[50vw] resize overflow-y-scroll">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Error Details</SheetTitle>
          <SheetDescription>
            Detailed information about this error
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-start flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Clock className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-md text-white sm:text-xs">Created:</span>
            <span className="text-md text-white sm:text-xs">
              {formatDate(data.Timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <Server className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-md text-white sm:text-xs">Service:</span>
            <span className="text-md text-white sm:text-xs">
              {data.ServiceName}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <FileCode className="h-4 w-4 text-white sm:text-xs" />
            <span className="text-md text-white sm:text-xs">Operation:</span>
            <span className="text-md text-white sm:text-xs">
              {data.SpanName}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
            <AlertCircle className="h-4 w-4 text-red-500 sm:text-xs" />
            <span className="text-md text-white sm:text-xs">Status:</span>
            <span className="text-md text-red-500">ERROR</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Error Message</h3>
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <pre className="text-sm whitespace-pre-wrap text-red-500">
                {data.StatusMessage || "No error message available"}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Trace Details</h3>
            <div className="flex items-start bg-blue-600/10 p-3 rounded-lg">
              <div className="grid items-center gap-2 text-sm">
                <div className="text-gray-500 sm:text-xs">Trace ID:</div>
                <div>{data.TraceId}</div>
                <div className="text-gray-500 sm:text-xs">Span ID:</div>
                <div>{data.SpanId}</div>
                <div className="text-gray-500 sm:text-xs">Parent Span ID:</div>
                <div>{data.ParentSpanId || "None"}</div>
                <div className="text-gray-500 sm:text-xs">Duration:</div>
                <div>{duration}</div>
              </div>
            </div>
          </div>

          {Object.keys(data.SpanAttributes).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Attributes</h3>
              <div className="bg-blue-600/10 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(data.SpanAttributes).map(([key, value]) => (
                    <>
                      <div className="text-gray-500 sm:text-xs">{key}:</div>
                      <div>{value}</div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExceptionRow;
