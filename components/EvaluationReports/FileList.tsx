import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { EvaluationFile } from "@/lib/EvaluationReports/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface FileListProps {
  files: EvaluationFile[];
  loading: boolean;
  error: string | null;
  onDelete: (fileId: string) => void;
  onView: (fileId: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, loading, error, onDelete, onView }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatId = (id: string) => {
    if (!id) return 'N/A';
    if (id.length <= 12) return id;
    
    return `${id.substring(0, 7)}...${id.substring(id.length - 5)}`;
  };

  const renderStatus = (status?: string) => {
    if (!status) return <Badge variant="outline" className="bg-gray-100">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName || 'this file' });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onDelete(fileToDelete.id);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const isProcessing = (file: EvaluationFile) => {
    return file.status?.toLowerCase() === 'processing';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading evaluation reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Completed At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              No evaluation reports found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Completed At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={file.id || index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell title={file.id || 'No ID'}>
                {formatId(file.id || '')}
              </TableCell>
              <TableCell className="font-medium">{file.file_name || 'Unnamed'}</TableCell>
              <TableCell>{file.project || 'Unknown'}</TableCell>
              <TableCell>{renderStatus(file.status)}</TableCell>
              <TableCell>{formatDate(file.create_at)}</TableCell>
              <TableCell>{formatDate(file.complete_time)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onView(file.id)}
                    disabled={isProcessing(file)}
                    title={isProcessing(file) ? 'Evaluation still in progress' : 'View results'}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClick(file.id, file.file_name || '')}
                    disabled={isProcessing(file)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to delete the file "{fileToDelete?.name}" ? 
                This action cannot be undone and all associated data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileList;