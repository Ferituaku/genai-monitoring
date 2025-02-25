import { useState, useCallback } from "react";
import { VaultData, VaultFormData, ApiResponse } from "@/types/vault";
// import { getToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// const getAuthHeaders = () => {
//   const token = getToken();
//   return {
//     "Content-Type": "application/json",
//     Authorization: token ? `Bearer ${token}` : "",
//   };
// };

export const vaultClient = {
  async getVaultData(): Promise<VaultData[]> {
    const response = await fetch(`${API_BASE_URL}/vault/get_values`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
      // headers: getAuthHeaders(),
    });

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async addVaultEntry(formData: VaultFormData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/vault/add_vault`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', 
      },
      // headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to add vault entry");
    return { message: "Vault entry added successfully" };
  },

  async updateVaultEntry(key: string, value: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/vault/update_value`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json', 
      },
      // headers: getAuthHeaders(),
      body: JSON.stringify({ api_key: key, value }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to update vault entry");
    return { message: "Vault entry updated successfully" };
  },

  async deleteVaultEntry(key: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/vault/delete_value`, {
      method: "DELETE",
      // headers: getAuthHeaders(),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: key }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to delete vault entry");
    return { message: "Vault entry deleted successfully" };
  },
};

export const useVault = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaultData, setVaultData] = useState<VaultData[]>([]);

  const fetchVaultData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vaultClient.getVaultData();
      setVaultData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    vaultData,
    isLoading,
    error,
    fetchVaultData,
    addVaultEntry: vaultClient.addVaultEntry,
    updateVaultEntry: vaultClient.updateVaultEntry,
    deleteVaultEntry: vaultClient.deleteVaultEntry,
  };
};
