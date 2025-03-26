import axios from "axios";

export interface EvaluationFile {
  id: string;
  create_at: string;
  file_name: string;
  json_data: EvaluationDetail[];
  project: string;
  status?: string;
  complete_time?: string;
}

export interface EvaluationDetail {
  Input: string;
  "Ground Truth": string;
  Output: string;
  "Token Metrics": number;
  "Token Chatbot": number;
  "Relevancy Score": number;
  "Relevancy Description": string;
  "Accuracy Score": number;
  "Accuracy Description": string;
  "Completeness Score": number;
  "Completeness Description": string;
  "Clarity Score": number;
  "Clarity Description": string;
  "Coherence Score": number;
  "Coherence Description": string;
  "Appropriateness Score": number;
  "Appropriateness Description": string;
  "Time Score": number;
  "Time Description": string;
  "Consistency Score": number;
  "Consistency Description": string;
  Threshold: number;
}

export interface UploadPayload {
  scope: string;
  drift_threshold: number;
  chat_api_url: string;
  chatbot_email: string;
  auth_username: string;
  auth_password: string;
  auth: null;
  data: Array<{
    inputs: string;
    ground_truth: string;
  }>;
  criteria_score: string;
  openai_api_key: string;
  openai_api_base: string;
  openai_api_version: string;
  openai_api_type: string;
  openai_deployment_name: string;
  json_filename?: string;
}

export class EvaluationService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  static async getAllFiles(): Promise<EvaluationFile[]> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/file_json`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching evaluation files:", error);
      throw error;
    }
  }

  static async deleteFile(fileId: string): Promise<any> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/delete_file`, {
        fileId: fileId,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  static async getFileDetails(
    fileId: string
  ): Promise<{ json_data: EvaluationDetail[] }> {
    try {
      console.log(`Fetching details for file ID: ${fileId}`);

      const response = await axios.post(`${this.API_BASE_URL}/get_json`, {
        fileId: fileId,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching file details:", error);
      throw error;
    }
  }

  static async runEvaluation(payload: UploadPayload): Promise<any> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/upload`, payload);
      return response.data;
    } catch (error) {
      console.error("Error uploading evaluation:", error);
      throw error;
    }
  }
  static async exportToCSV(fileId: string): Promise<Blob> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/export_csv`,
        { fileId: fileId },
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw error;
    }
  }
}
