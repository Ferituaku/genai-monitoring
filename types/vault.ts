export interface VaultData {
    key: string;
    createdBy: string;
    lastUpdatedOn: string;
    value?: string;
  }
  
  export interface VaultFormData {
    key: string;
    value: string;
    createdBy: string;
  }
  
  export interface ApiResponse {
    error?: string;
    message?: string;
  }