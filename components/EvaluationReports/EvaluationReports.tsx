"use client";

import React, { useState, useEffect } from "react";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EvaluationService,
  EvaluationFile,
  EvaluationDetail,
} from "@/lib/EvaluationReports/api";
import SearchBar from "./SearchBar";
import FileList from "./FileList";
import UploadForm from "./UploadForm";
import DetailsView from "./DetailsView";
import Pagination from "@/components/Pagination/Pagination";

const EvaluationReports: React.FC = () => {
  // State untuk daftar file
  const [evaluationFiles, setEvaluationFiles] = useState<EvaluationFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Jumlah file per halaman

  // State untuk detail file
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<EvaluationDetail[] | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // State untuk form upload
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

      const file = evaluationFiles.find((f) => f.id === fileId);
      if (!file) throw new Error("File tidak ditemukan");

      setSelectedFileId(fileId);
      setSelectedFileName(file.file_name);
      setDetailsOpen(true);

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

  // Filter files berdasarkan search query
  const filteredFiles = evaluationFiles.filter((file) => {
    if (!file) return false;

    const idMatch =
      file.id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const filenameMatch =
      file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
      false;
    const projectMatch =
      file.project?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;

    return idMatch || filenameMatch || projectMatch;
  });

  // Reset ke halaman pertama jika hasil pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Hitung total halaman
  const totalPages = Math.ceil(filteredFiles.length / pageSize);

  // Jika currentPage melebihi totalPages setelah perubahan data, perbaiki
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [totalPages]);

  // Menentukan file yang akan ditampilkan pada halaman saat ini
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="h-full">
      <div className="top-[70px] p-2 items-center gap-4">
        <DynamicBreadcrumb />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3">
        <h1 className="font-semibold text-xl">Evaluation Reports</h1>
        <Button onClick={() => setUploadOpen(true)} className="md:ml-auto">
          <Upload className="h-4 w-4 mr-1" />
          Run Evaluation
        </Button>
      </div>

      <div className="p-3">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <Card>
          <CardContent className="p-4">
            <FileList
              files={paginatedFiles} // Menampilkan file yang sudah difilter berdasarkan pagination
              loading={loading}
              error={error}
              onDelete={handleDelete}
              onView={handleViewDetails}
            />
          </CardContent>
        </Card>

        {/* Komponen Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredFiles.length} // Tambahkan totalItems
              pageSize={pageSize} // Tambahkan pageSize
              onPageChange={setCurrentPage}
            />
          </div>
        )}
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
        fileId={selectedFileId}
        details={fileDetails}
        loading={detailsLoading}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};

export default EvaluationReports;
