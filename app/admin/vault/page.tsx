"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VaultFormData } from "@/types/vault";
import { useToast } from "@/hooks/use-toast";
import { useVault } from "@/hooks/Vault/use-vault";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { VaultTable } from "@/components/Vault/VaultTable";
import { AddKeyModal } from "@/components/Vault/AddKeyVault";
import { EditKeyModal } from "@/components/Vault/EditKeyModal";
import Pagination from "@/components/Pagination/Pagination";

export default function VaultPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2; // Jumlah item per halaman

  const { toast } = useToast();

  const {
    vaultData,
    isLoading,
    error,
    fetchVaultData,
    addVaultEntry,
    updateVaultEntry,
    deleteVaultEntry,
  } = useVault();

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [vaultData]);

  const handleAddKey = async (formData: VaultFormData) => {
    const result = await addVaultEntry(formData);
    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      setIsAddModalOpen(false);
      toast({ title: "Success", description: result.message });
      fetchVaultData();
    }
  };

  const handleEdit = (key: string) => {
    const item = vaultData.find((item) => item.key === key);
    if (item) {
      setEditingKey(key);
      setEditingValue(item.value);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (newValue: string) => {
    const result = await updateVaultEntry(editingKey, newValue);
    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      setIsEditModalOpen(false);
      toast({ title: "Success", description: result.message });
      fetchVaultData();
    }
  };

  const handleDelete = async (key: string) => {
    const result = await deleteVaultEntry(key);
    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      toast({ title: "Success", description: result.message });
      fetchVaultData();
    }
  };

  const totalItems = vaultData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = vaultData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [totalPages]);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
      <div className="p-6 pt-5">
        <div className="flex justify-end p-3">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Key
          </Button>
        </div>
        <Card>
          <CardContent className="p-4">
            <VaultTable
              data={paginatedData} // Data berdasarkan pagination
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Komponen Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
        {/* Add Modal */}
        <AddKeyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddKey}
        />
        
        {/* Edit Modal */}
        <EditKeyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          currentKey={editingKey}
          currentValue={editingValue}
        />
      </div>
  
  );
}
