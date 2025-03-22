import React from "react";
import {
  MessageSquare,
  Clock,
  Coins,
  Braces,
  AlarmClock,
  Ticket,
  Boxes,
  Container,
  ClipboardType,
  DoorClosed,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TraceData } from "@/types/trace";

// Extension for TraceData interface to handle alternative formats
interface ExtendedTraceData extends TraceData {
  // Alternative format that might appear from the API
  Events?: {
    Attributes?: Array<{
      "gen_ai.prompt"?: string;
      "gen_ai.completion"?: string;
      [key: string]: string | undefined;
    }>;
    Name?: string[];
    Timestamp?: string[];
  };
}

interface RequestRowProps {
  data: ExtendedTraceData;
}

export const RequestRow = ({ data }: RequestRowProps) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const modelName = data.SpanAttributes["gen_ai.request.model"] || "";
  const completionTokens = parseInt(
    data.SpanAttributes["gen_ai.usage.output_tokens"] || "0"
  );
  const promptTokens = parseInt(
    data.SpanAttributes["gen_ai.usage.input_tokens"] || "0"
  );
  const totalTokens = parseInt(
    data.SpanAttributes["gen_ai.usage.total_tokens"] || "0"
  );
  const costUsage = `$${parseFloat(
    data.SpanAttributes["gen_ai.usage.cost"] || "0"
  ).toFixed(10)}`;
  const duration = `${(data.Duration / 1_000_000_000).toFixed(2)}s`;
  const environment = data.ResourceAttributes["deployment.environment"] || "";
  const type = data.SpanAttributes["gen_ai.operation.name"] || "";
  const endpoint = data.SpanAttributes["gen_ai.endpoint"] || "";

  // Function to get prompt and completion by handling both formats
  const getPromptAndCompletion = (): { prompt: string; completion: string } => {
    let prompt = "";
    let completion = "";

    // Format 1: Using "Events.Attributes" (dot notation)
    if (data["Events.Attributes"] && Array.isArray(data["Events.Attributes"])) {
      const promptAttr = data["Events.Attributes"].find(
        (attr) => "gen_ai.prompt" in attr
      );
      const completionAttr = data["Events.Attributes"].find(
        (attr) => "gen_ai.completion" in attr
      );

      if (promptAttr && promptAttr["gen_ai.prompt"]) {
        prompt = promptAttr["gen_ai.prompt"];
      }

      if (completionAttr && completionAttr["gen_ai.completion"]) {
        completion = completionAttr["gen_ai.completion"];
      }
    }

    // Format 2: Using nested "Events.Attributes" object
    if (
      !prompt &&
      data.Events &&
      data.Events.Attributes &&
      Array.isArray(data.Events.Attributes)
    ) {
      const promptAttr = data.Events.Attributes.find(
        (attr) => "gen_ai.prompt" in attr
      );
      const completionAttr = data.Events.Attributes.find(
        (attr) => "gen_ai.completion" in attr
      );

      if (promptAttr && promptAttr["gen_ai.prompt"]) {
        prompt = promptAttr["gen_ai.prompt"];
      }

      if (completionAttr && completionAttr["gen_ai.completion"]) {
        completion = completionAttr["gen_ai.completion"];
      }
    }

    return { prompt, completion };
  };

  // Get prompt and completion
  const { prompt, completion } = getPromptAndCompletion();

  const formatTraceData = () => {
    const root = {
      root: {
        Timestamp: data.Timestamp,
        TraceId: data.TraceId,
        SpanId: data.SpanId,
        ParentSpanId: data.ParentSpanId,
        TraceState: data.TraceState,
        ServiceName: data.ServiceName,
        SpanName: data.SpanName,
        SpanKind: data.SpanKind,
        ScopeName: data.ScopeName,
        ScopeVersion: data.ScopeVersion,
        StatusCode: data.StatusCode,
        StatusMessage: data.StatusMessage,
        SpanAttributes: data.SpanAttributes,
        ResourceAttributes: data.ResourceAttributes,
        Duration: data.Duration,
        "Events.Attributes": data["Events.Attributes"],
        "Events.Name": data["Events.Name"],
        "Events.Timestamp": data["Events.Timestamp"],
        "Links.TraceId": data["Links.TraceId"],
        "Links.SpanId": data["Links.SpanId"],
        "Links.TraceState": data["Links.TraceState"],
        "Links.Attributes": data["Links.Attributes"],
      },
    };

    return JSON.stringify(root, null, 2);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <tr className="border-b border-gray-700 hover:bg-slate-400/10 transition-colors cursor-pointer">
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {formatDate(data.Timestamp)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[150px]">
            {data.ServiceName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm w-[180px]">
            {modelName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-left w-[150px]">
            {environment}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]">
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
      <SheetContent className="w-full max-w-4xl sm:w-[55vw] lg:w-[50vw] resize overflow-y-scroll">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-sm sm:text-xs font-bold">
            Request Details
          </SheetTitle>
          <SheetDescription>
            Detailed information about this request
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-start flex-wrap gap-3 mb-4">
          <InfoBadge
            icon={Clock}
            label="Created"
            value={formatDate(data.Timestamp)}
          />
          <InfoBadge icon={Coins} label="Cost" value={costUsage} />
          <InfoBadge icon={Boxes} label="Model" value={modelName} />
          <InfoBadge
            icon={AlarmClock}
            label="Request Duration"
            value={duration}
          />
          <InfoBadge
            icon={Braces}
            label="Prompt Token"
            value={promptTokens.toString()}
          />
          <InfoBadge
            icon={Ticket}
            label="Total Token"
            value={totalTokens.toString()}
          />
          <InfoBadge
            icon={MessageSquare}
            label="Completion"
            value={completionTokens.toString()}
          />
          <InfoBadge icon={Container} label="Environment" value={environment} />
          <InfoBadge icon={ClipboardType} label="Type" value={type} />
          <InfoBadge icon={DoorClosed} label="Endpoint" value={endpoint} />
        </div>

        <div className="space-y-4">
          <DetailSection title="Prompt" content={prompt} />
          <DetailSection title="Response" content={completion} />
          <DetailSection title="Trace" content={formatTraceData()} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper Components with type definitions
interface InfoBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const InfoBadge = ({ icon: Icon, label, value }: InfoBadgeProps) => (
  <div className="flex items-center gap-2 bg-blue-600/70 rounded-2xl p-2">
    <Icon className="h-4 w-4 text-white sm:text-xs" />
    <span className="text-sm text-white sm:text-xs">{label}:</span>
    <span className="text-sm text-white sm:text-xs">{value}</span>
  </div>
);

interface DetailSectionProps {
  title: string;
  content: string;
}

const DetailSection = ({ title, content }: DetailSectionProps) => (
  <div>
    <h3 className="text-sm font-medium mb-2">{title}</h3>
    <div className="bg-black p-3 rounded-lg overflow-auto max-h-[400px]">
      {content ? (
        <pre className="text-sm text-white whitespace-pre-wrap">{content}</pre>
      ) : (
        <div className="text-sm text-gray-400 italic">
          No {title.toLowerCase()} available
        </div>
      )}
    </div>
  </div>
);

export default RequestRow;
