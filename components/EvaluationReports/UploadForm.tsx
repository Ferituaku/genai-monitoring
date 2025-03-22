import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { EvaluationService } from "@/lib/EvaluationReports/api";

interface UploadFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ isOpen, onOpenChange, onUploadSuccess }) => {
  // Form state
  const [jsonData, setJsonData] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Success alert state
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  
  // Ref for textarea to force clearing
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form completely
  const resetForm = () => {
    setJsonData("");
    setUploadError(null);
    
    // Force clear the textarea using DOM directly
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  };

  // Handle dialog closing
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  // Handle closing of success alert
  const handleSuccessAlertClose = () => {
    setSuccessAlertOpen(false);
    onUploadSuccess();
  };

  const handleSubmit = async () => {
    try {
      setUploadLoading(true);
      setUploadError(null);

      let rawData;
      
      try {
        rawData = JSON.parse(jsonData);
      } catch (e) {
        setUploadError("Invalid JSON format. Please check your input.");
        setUploadLoading(false);
        return;
      }

      // Make API call using the service with raw JSON data
      const response = await EvaluationService.runEvaluation(rawData);

      if (response.success) {
        // Close the form dialog
        onOpenChange(false);
        
        // Reset form immediately
        resetForm();
        
        // Show success alert
        setSuccessAlertOpen(true);
      } else {
        setUploadError("Upload failed: " + (response.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error during upload:", err);
      setUploadError("Upload failed: " + (err.message || "Network error"));
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Run Evaluation</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Raw JSON Data</label>
              <div className="border rounded-md p-3">
                <textarea
                  ref={textareaRef}
                  placeholder="Enter complete JSON configuration"
                  value={jsonData}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonData(e.target.value)}
                  rows={15}
                  className="w-full font-mono text-sm resize-y"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste the complete JSON configuration including all necessary parameters
              </p>
            </div>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
              {uploadError}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleDialogClose(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploadLoading || !jsonData}
            >
              {uploadLoading ? "Processing..." : "Run Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Alert Dialog */}
      <AlertDialog open={successAlertOpen} onOpenChange={setSuccessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Evaluation started successfully! Processing in background.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessAlertClose}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UploadForm;