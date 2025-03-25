// components/Request/ExportButton.tsx
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Filters } from "@/types/requests";
import { TimeFrameParams } from "@/types/timeframe";
import { SortDirection, SortField, TraceData } from "@/types/trace";
import { downloadCSV, exportTracesToCSV, generateCSVFromTraces } from "@/lib/ExportService/ExportService";
import { toast } from "@/hooks/use-toast";


interface ExportButtonProps {
  timeFrame: TimeFrameParams;
  filters: Filters;
  sortField: SortField;
  sortDirection: SortDirection;
  searchTerm: string;
  traces?: TraceData[];
  onExportStart?: () => void;
  onExportComplete?: () => void;
  isDisabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  timeFrame,
  filters,
  sortField,
  sortDirection,
  searchTerm,
  traces,
  onExportStart,
  onExportComplete,
  isDisabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (onExportStart) onExportStart();

      // If we have all traces data already in the component, we can generate CSV on frontend
      // This is useful for small datasets and avoids an additional server request
      if (traces && traces.length > 0 && traces.length < 1000) {
        const csvContent = generateCSVFromTraces(traces);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        downloadCSV(csvContent, `trace-requests-${timestamp}.csv`);
      } else {
        // For larger datasets, use the server-side export
        await exportTracesToCSV({
          timeFrame,
          filters,
          sortField,
          sortDirection,
          searchTerm,
        });
      }

      toast({
        title: "Export successful",
        description: "The data has been exported to CSV successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      if (onExportComplete) onExportComplete();
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="icon"
      className="bg-white hover:bg-slate-100 border border-gray-300"
      disabled={isExporting || isDisabled}
      title="Export to CSV"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
};
