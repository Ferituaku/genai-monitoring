import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { EvaluationDetail } from "@/lib/EvaluationReports/api";

interface DetailsViewProps {
  isOpen: boolean;
  filename: string | null;
  details: EvaluationDetail[] | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({ 
  isOpen, 
  filename, 
  details, 
  loading, 
  onOpenChange 
}) => {
  // Helper function to calculate averages
  const calculateAverage = (key: keyof EvaluationDetail) => {
    if (!details || details.length === 0) return 0;
    
    let sum = 0;
    let count = 0;
    details.forEach(item => {
      if (item && typeof item[key] === 'number') {
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
    details.forEach(item => {
      if (item && typeof item[key] === 'number') {
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
    if (score === undefined) return 'N/A';
    return <span className={getScoreColor(score)}>{score}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Details: {filename || 'File'}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p>Loading details...</p>
          </div>
        ) : details && details.length > 0 ? (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Average Scores</h3>
                <div className="space-y-2">
                  {[
                    { name: "Relevancy", key: "Relevancy Score" as keyof EvaluationDetail },
                    { name: "Accuracy", key: "Accuracy Score" as keyof EvaluationDetail },
                    { name: "Completeness", key: "Completeness Score" as keyof EvaluationDetail },
                    { name: "Clarity", key: "Clarity Score" as keyof EvaluationDetail },
                    { name: "Coherence", key: "Coherence Score" as keyof EvaluationDetail },
                    { name: "Appropriateness", key: "Appropriateness Score" as keyof EvaluationDetail },
                    { name: "Time", key: "Time Score" as keyof EvaluationDetail },
                    { name: "Consistency", key: "Consistency Score" as keyof EvaluationDetail },
                  ].map((metric) => {
                    const avgScore = calculateAverage(metric.key);
                    const scoreClass = avgScore >= 2.5 ? "text-green-600 dark:text-green-400" :
                                      avgScore >= 1.5 ? "text-yellow-600 dark:text-yellow-400" : 
                                      "text-red-600 dark:text-red-400";
                    
                    return (
                      <div key={String(metric.key)} className="flex justify-between">
                        <span>{metric.name}:</span>
                        <span className={`font-medium ${scoreClass}`}>{avgScore.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Threshold:</span>
                    <span>{details[0]?.Threshold || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Token Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Average Chatbot Tokens:</span>
                    <span className="font-medium">
                      {calculateAverage("Token Chatbot" as keyof EvaluationDetail).toFixed(0)}
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
                    <div>Relevancy: <span className={`font-bold ${getScoreColor(detail?.["Relevancy Score"])}`}>
                      {detail?.["Relevancy Score"]}
                    </span></div>
                    <div>Accuracy: <span className={`font-bold ${getScoreColor(detail?.["Accuracy Score"])}`}>
                      {detail?.["Accuracy Score"]}
                    </span></div>
                    <div>Completeness: <span className={`font-bold ${getScoreColor(detail?.["Completeness Score"])}`}>
                      {detail?.["Completeness Score"]}
                    </span></div>
                    <div>Consistency: <span className={`font-bold ${getScoreColor(detail?.["Consistency Score"])}`}>
                      {detail?.["Consistency Score"]}
                    </span></div>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Input:</h4>
                    <div className="bg-white dark:bg-gray-800 border rounded p-3 overflow-y-auto max-h-[200px]">
                      <p className="whitespace-pre-wrap break-words">{detail?.Input || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Output:</h4>
                    <div className="bg-white dark:bg-gray-800 border rounded p-3 overflow-y-auto max-h-[200px]">
                      <p className="whitespace-pre-wrap break-words">{detail?.Output || 'N/A'}</p>
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