import { Application } from "@/types/catalogue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

export class ApplicationService {
  private baseUrl: string = `${API_BASE_URL}`;

  async getApplications(): Promise<Application[]> {
    try {
      const response = await fetch(`${this.baseUrl}/appcatalogue`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }
}
