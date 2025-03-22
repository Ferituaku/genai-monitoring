"use client";

import React, { useState, useEffect } from "react";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EvaluationService, EvaluationFile, EvaluationDetail } from "@/lib/EvaluationReports/api";
import SearchBar from "./SearchBar";
import FileList from "./FileList";
import UploadForm from "./UploadForm";
import DetailsView from "./DetailsView";

const EvaluationReports: React.FC = () => {
  // State for file listing
  const [evaluationFiles, setEvaluationFiles] = useState<EvaluationFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for file details
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<EvaluationDetail[] | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // State for upload form
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    fetchEvaluationFiles();
  }, []);

  const fetchEvaluationFiles = async () => {
    try {
      setLoading(true);
      const files = await EvaluationService.getAllFiles();
      setEvaluationFiles(files);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch evaluation files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    // Find file with matching ID and get the filename
    const file = evaluationFiles.find(f => f.id === fileId);
    const fileName = file?.file_name || 'this file';

    try {
      await EvaluationService.deleteFile(fileId);
      fetchEvaluationFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const handleViewDetails = async (fileId: string) => {
    try {
      setDetailsLoading(true);
      
      // Find file with matching ID
      const file = evaluationFiles.find(f => f.id === fileId);
      if (!file) {
        throw new Error("File tidak ditemukan");
      }
      
      setSelectedFileId(fileId);
      setSelectedFileName(file.file_name);
      setDetailsOpen(true);
      
      console.log(`Fetching details for file ID: ${fileId}`);
      const response = await EvaluationService.getFileDetails(fileId);
      
      if (response && Array.isArray(response.json_data)) {
        setFileDetails(response.json_data);
      } else {
        console.error("Invalid response format:", response);
        setFileDetails([]);
      }
    } catch (err) {
      console.error("Error fetching details:", err);
      alert("Failed to fetch file details");
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Filter files based on search query



  
  const filteredFiles = evaluationFiles.filter((file) => {
    if (!file) return false;
    
    const idMatch = file.id && typeof file.id === 'string'
      ? file.id.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    
    const filenameMatch = file.file_name && typeof file.file_name === 'string' 
      ? file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) 
      : false;
    
    const projectMatch = file.project && typeof file.project === 'string'
      ? file.project.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    
    return idMatch || filenameMatch || projectMatch;
  });

  return (
    <div className="min-h-screen">
      <div className="top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3">
        <h1 className="font-semibold text-xl">Evaluation Reports</h1>
        <Button
          onClick={() => setUploadOpen(true)}
          className="md:ml-auto"
        >
          <Upload className="h-4 w-4 mr-1" />
          Run Evaluation
        </Button>
      </div>

      <div className="p-3">
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />

        <Card>
          <CardContent className="p-4">
            <FileList 
              files={filteredFiles}
              loading={loading}
              error={error}
              onDelete={handleDelete}
              onView={handleViewDetails}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upload Form Dialog */}
      <UploadForm 
        isOpen={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadSuccess={fetchEvaluationFiles}
      />

      {/* Details Dialog */}
      <DetailsView 
        isOpen={detailsOpen}
        filename={selectedFileName}
        details={fileDetails}
        loading={detailsLoading}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};

export default EvaluationReports;