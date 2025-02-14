"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VaultFormData } from "@/types/vault";
import { useToast } from "@/hooks/use-toast";
import { useVault } from "@/hooks/Vault/useVault";
import DynamicBreadcrumb from "@/components/Breadcrum";
import { VaultTable } from "@/components/Vault/VaultTable";
import { AddKeyModal } from "@/components/Vault/AddKeyVault";

export default function VaultPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    }
  };

  const handleEdit = async (key: string) => {
    const newValue = prompt("Enter new value:");
    if (newValue) {
      const result = await updateVaultEntry(key, newValue);
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
      }
    }
  };

  const handleDelete = async (key: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
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
      }
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
            Add New Key
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
        <AddKeyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddKey}
        />
      </div>
    </div>
  );
}
