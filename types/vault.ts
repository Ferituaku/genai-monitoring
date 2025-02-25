export interface VaultData {
  key: string;      
  project: string;
  value: string;
  createdBy: string;
  lastUpdatedOn: string; 
}

export interface VaultFormData {
  api_key: string;
  project: string;
  value: string;
}

export interface ApiResponse {
  error?: string;
  message?: string;
  api_key?: string;
  value?: string;
  project?: string;
  created_at?: string;
  updated_at?: string;
}