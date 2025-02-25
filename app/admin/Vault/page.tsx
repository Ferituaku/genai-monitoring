"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VaultFormData } from "@/types/vault";
import { useToast } from "@/hooks/use-toast";
import { useVault } from "@/hooks/Vault/use-vault";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { VaultTable } from "@/components/vault/VaultTable";
import { AddKeyModal } from "@/components/vault/AddKeyVault";
import { EditKeyModal } from "@/components/vault/EditKeyModal";

export default function VaultPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [editingValue, setEditingValue] = useState("");
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

  const handleAddKey = async (formData: VaultFormData) => {
    const result = await addVaultEntry(formData);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: result.message,
      });
      // Refresh data
      fetchVaultData();
    }
  };

  const handleEdit = (key: string) => {
    // Find the current value of the key
    const item = vaultData.find(item => item.key === key);
    if (item) {
      setEditingKey(key);
      setEditingValue(item.value);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (newValue: string) => {
    const result = await updateVaultEntry(editingKey, newValue);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: result.message,
      });
      // Refresh data
      fetchVaultData();
    }
  };

  const handleDelete = async (key: string) => {
    const result = await deleteVaultEntry(key);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      toast({
        title: "Success",
        description: result.message,
      });
      // Refresh data
      fetchVaultData();
    }
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="top-0 p-2">
        <DynamicBreadcrumb />
      </div>
      <div className="p-6 pt-5">
        <div className="flex justify-end p-4">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            Add New Vault
          </Button>
        </div>
        <Card>
          <CardContent>
            <VaultTable
              data={vaultData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        
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
    </div>
  );
}