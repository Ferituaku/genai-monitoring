import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EvaluationDetail,
  EvaluationService,
} from "@/lib/EvaluationReports/api";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

interface DetailsViewProps {
  isOpen: boolean;
  filename: string | null;
  fileId: string | null;
  details: EvaluationDetail[] | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({
  isOpen,
  fileId,
  filename,
  details,
  loading,
  onOpenChange,
}) => {
  const [exportLoading, setExportLoading] = React.useState(false);
  // Helper function to calculate averages
  const calculateAverage = (key: keyof EvaluationDetail) => {
    if (!details || details.length === 0) return 0;

    let sum = 0;
    let count = 0;
    details.forEach((item) => {
      if (item && typeof item[key] === "number") {
        sum += item[key] as number;
        count++;
      }
    });
    return count > 0 ? sum / count : 0;
  };

  // Helper function to calculate sum
  const calculateSum = (key: keyof EvaluationDetail) => {
    if (!details || details.length === 0) return 0;

    let sum = 0;
    details.forEach((item) => {
      if (item && typeof item[key] === "number") {
        sum += item[key] as number;
      }
    });
    return sum;
  };

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score === 3) return "text-green-600 dark:text-green-400";
    if (score === 2) return "text-yellow-600 dark:text-yellow-400";
    if (score === 1) return "text-red-600 dark:text-red-400";
    return "";
  };

  // Helper function to render a colored score
  const renderScore = (score: number | undefined) => {
    if (score === undefined) return "N/A";
    return <span className={getScoreColor(score)}>{score}</span>;
  };
  const handleExportCSV = async () => {
    if (!fileId) {
      alert("File ID is missing");
      return;
    }

    try {
      setExportLoading(true);
      const response = await EvaluationService.exportToCSV(fileId);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename || "evaluation"}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };
  const handleClientExport = () => {
    if (!details || !details.length) {
      alert("No data available to export.");
      return;
    }

    try {
      // Convert details to CSV format
      const headers = Object.keys(details[0]).join(",");
      const rows = details.map((item) => {
        return Object.values(item)
          .map((val) => {
            // Handle strings with commas by wrapping in quotes
            if (typeof val === "string" && val.includes(",")) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",");
      });

      const csvContent = [headers, ...rows].join("\n");

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename || "evaluation"}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-8">
            <span>Evaluation Details: {filename || "File"}</span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleClientExport}
              disabled={loading || !details || details.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p>Loading details...</p>
          </div>
        ) : details && details.length > 0 ? (
          <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Average Scores</h3>
                <div className="space-y-2">
                  {[
                    {
                      name: "Relevancy",
                      key: "Relevancy Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Accuracy",
                      key: "Accuracy Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Completeness",
                      key: "Completeness Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Clarity",
                      key: "Clarity Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Coherence",
                      key: "Coherence Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Appropriateness",
                      key: "Appropriateness Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Time",
                      key: "Time Score" as keyof EvaluationDetail,
                    },
                    {
                      name: "Consistency",
                      key: "Consistency Score" as keyof EvaluationDetail,
                    },
                  ].map((metric) => {
                    const avgScore = calculateAverage(metric.key);
                    const scoreClass =
                      avgScore >= 2.5
                        ? "text-green-600 dark:text-green-400"
                        : avgScore >= 1.5
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400";

                    return (
                      <div
                        key={String(metric.key)}
                        className="flex justify-between"
                      >
                        <span>{metric.name}:</span>
                        <span className={`font-medium ${scoreClass}`}>
                          {avgScore.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Threshold:</span>
                    <span>{details[0]?.Threshold || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Token Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Average Chatbot Tokens:</span>
                    <span className="font-medium">
                      {calculateAverage(
                        "Token Chatbot" as keyof EvaluationDetail
                      ).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Chatbot Tokens:</span>
                    <span className="font-medium">
                      {calculateSum("Token Chatbot" as keyof EvaluationDetail)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-medium mb-2">Evaluation Results</h3>

            {details.map((detail, idx) => (
              <div key={idx} className="mb-8 border rounded-lg overflow-hidden">
                <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 font-medium flex justify-between items-center">
                  <span>Golden Question {idx + 1}</span>
                  <div className="flex space-x-4">
                    <div>
                      Relevancy:{" "}
                      <span
                        className={`font-bold ${getScoreColor(
                          detail?.["Relevancy Score"]
                        )}`}
                      >
                        {detail?.["Relevancy Score"]}
                      </span>
                    </div>
                    <div>
                      Accuracy:{" "}
                      <span
                        className={`font-bold ${getScoreColor(
                          detail?.["Accuracy Score"]
                        )}`}
                      >
                        {detail?.["Accuracy Score"]}
                      </span>
                    </div>
                    <div>
                      Completeness:{" "}
                      <span
                        className={`font-bold ${getScoreColor(
                          detail?.["Completeness Score"]
                        )}`}
                      >
                        {detail?.["Completeness Score"]}
                      </span>
                    </div>
                    <div>
                      Consistency:{" "}
                      <span
                        className={`font-bold ${getScoreColor(
                          detail?.["Consistency Score"]
                        )}`}
                      >
                        {detail?.["Consistency Score"]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Input:
                    </h4>
                    <div className="bg-white dark:bg-gray-800 border rounded p-3 overflow-y-auto max-h-[200px]">
                      <p className="whitespace-pre-wrap break-words">
                        {detail?.Input || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Output:
                    </h4>
                    <div className="bg-white dark:bg-gray-800 border rounded p-3 overflow-y-auto max-h-[200px]">
                      <p className="whitespace-pre-wrap break-words">
                        {detail?.Output || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p>No details available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsView;
