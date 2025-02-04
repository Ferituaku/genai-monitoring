"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultData, VaultFormData } from "./VaultData";
import { VaultTable } from "@/components/VaultTable/VaultTable";
import { AddKeyModal } from "@/components/VaultTable/AddKeyVault";

const page = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [vaultData] = useState<VaultData[]>([
    {
      key: "STAGING_TAX_API-KEY",
      createdBy: "John Doe",
      lastUpdatedOn: "2023-01-01",
    },
    {
      key: "IZIN_COBA",
      createdBy: "Ferro",
      lastUpdatedOn: "2025-01-01",
    },
  ]);
  const handleAddKey = (formData: VaultFormData) => {
    const newKey: VaultData = {
      key: formData.key,
      createdBy: "Current User", // Replace with actual user data
      lastUpdatedOn: new Date().toISOString().split("T")[0],
    };

    // setVaultData((prev) => [...prev, newKey]);
    // toast({
    //   title: "Success",
    //   description: "New key has been added successfully",
    // });
  };
  const handleEdit = (key: string) => {
    console.log("Editing:", key);
    // Add your edit logic here
  };

  const handleDelete = (key: string) => {
    console.log("Deleting:", key);
    // Add your delete logic here
  };
  return (
    <div className="p-6 pt-5">
      <div className="flex justify-end p-4">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 text-white"
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
          />
        </CardContent>
      </Card>
      <AddKeyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddKey}
      />
    </div>
  );
};

export default page;
