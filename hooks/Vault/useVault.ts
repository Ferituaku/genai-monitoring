import { useState, useCallback } from "react";
import { VaultData, VaultFormData, ApiResponse } from "@/types/vault";

export const useVault = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaultData, setVaultData] = useState<VaultData[]>([]);

  const fetchVaultData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/get_values`);

      if (!response.ok) {
        throw new Error("Failed to fetch traces");
      }
      const data = await response.json();
      setVaultData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addVaultEntry = useCallback(
    async (formData: VaultFormData): Promise<ApiResponse> => {
      try {
        const response = await fetch(`http://localhost:5000/add_vault`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to add vault entry");
        await fetchVaultData();
        return { message: "Vault entry added successfully" };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to add vault entry",
        };
      }
    },
    [fetchVaultData]
  );

  const updateVaultEntry = useCallback(
    async (key: string, value: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`http://localhost:5000/update_value`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: key, value }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to update vault entry");
        await fetchVaultData();
        return { message: "Vault entry updated successfully" };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to update vault entry",
        };
      }
    },
    [fetchVaultData]
  );

  const deleteVaultEntry = useCallback(
    async (key: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(
          `http://localhost:5000/delete_value/${key}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to delete vault entry");
        await fetchVaultData();
        return { message: "Vault entry deleted successfully" };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to delete vault entry",
        };
      }
    },
    [fetchVaultData]
  );

  return {
    vaultData,
    isLoading,
    error,
    fetchVaultData,
    addVaultEntry,
    updateVaultEntry,
    deleteVaultEntry,
  };
};
