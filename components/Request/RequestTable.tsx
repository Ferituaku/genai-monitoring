import { Card } from "@/components/ui/card";
import { TraceData } from "@/types/trace";
import { RequestRow } from "./RequestRow";

interface RequestTableProps {
  displayedTraces: TraceData[];
}

export const RequestTable = ({ displayedTraces }: RequestTableProps) => {
  return (
    <Card className="rounded-md">
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-200 z-10">
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                Service Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                Model
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                Environment
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
  );
};
