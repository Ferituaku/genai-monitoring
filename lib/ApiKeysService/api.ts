export interface ApiKey {
  name: string;
  api_key: string;
  created_at: string;
  project: string;
}
interface ApiResponse {
  error?: string;
  api_key?: string;
  name?: string;
  project?: string;
  created_at?: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export const apiClient = {
  async getAllApiKeys(): Promise<ApiKey[]> {
    const response = await fetch(`${API_BASE_URL}/apiKeys/get_all_api_keys`);
    if (!response.ok) {
      throw new Error("Failed to fetch API keys");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },
  async generateApiKey(name: string, project: string): Promise<ApiKey> {
    const response = await fetch(`${API_BASE_URL}/apiKeys/generate_api_key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, project }),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate API key");
    }

    if (!data.api_key) {
      throw new Error("No API key returned from server");
    }

    return {
      name: data.name || name,
      api_key: data.api_key,
      project: data.project || project,
      created_at: data.created_at || new Date().toISOString(),
    };
  },

  async deleteApiKey(apiKey: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/apiKeys/delete_api_key`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ api_key: apiKey }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete API key");
    }
  },
};
