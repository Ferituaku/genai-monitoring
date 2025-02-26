// VaultTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2, Eye } from "lucide-react";
import { VaultData } from "@/types/vault";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VaultTableProps {
  data: VaultData[];
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
  isLoading?: boolean;
}

export const VaultTable = ({
  data,
  onEdit,
  onDelete,
  isLoading,
}: VaultTableProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewValue = (value: string) => {
    setSelectedValue(value);
    setIsValueModalOpen(true);
  };

  const handleDeleteClick = (key: string) => {
    setKeyToDelete(key);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (keyToDelete) {
      onDelete(keyToDelete);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  // Fungsi untuk memendekkan nilai yang panjang
  const truncateValue = (value: string) => {
    if (value.length > 20) {
      return value.substring(0, 20) + "...";
    }
    return value;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>API Key</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.key}>
              <TableCell className="font-medium">
                {item.key.length > 10 ? `${item.key.substring(0, 10)}*************${item.key.substring(item.key.length - 4)}` : item.key}
              </TableCell>
              <TableCell>{item.project}</TableCell>
              <TableCell>{item.createdBy}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="mr-2">{truncateValue(item.value)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewValue(item.value)}
                    className="h-6 w-6"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {new Date(item.lastUpdatedOn).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(item.key)}
                  >
                    <SquarePen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(item.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal untuk menampilkan value lengkap */}
      <Dialog open={isValueModalOpen} onOpenChange={setIsValueModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Value Lengkap</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto max-h-60">
            <pre className="whitespace-pre-wrap break-all">{selectedValue}</pre>
          </div>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog untuk konfirmasi penghapusan */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vault?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
