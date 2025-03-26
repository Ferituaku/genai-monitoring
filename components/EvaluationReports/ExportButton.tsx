import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EvaluationDetail } from "@/lib/EvaluationReports/api";

interface ExportCSVButtonProps {
  details: EvaluationDetail[] | null;
  filename: string | null;
}

const ExportCSVButton: React.FC<ExportCSVButtonProps> = ({ details, filename }) => {
  const handleExport = async () => {
    if (!details || !details.length) {
      alert("No data available to export.");
      return;
    }

    try {
      // Convert details to CSV format
      const headers = Object.keys(details[0]).join(",");
      const rows = details.map(item => {
        return Object.values(item)
          .map(val => {
            // Handle strings with commas by wrapping in quotes
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(',');
      });
      
      const csvContent = [headers, ...rows].join('\n');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename || 'evaluation'}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className="flex items-center gap-2"
      disabled={!details || details.length === 0}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
};

export default ExportCSVButton;