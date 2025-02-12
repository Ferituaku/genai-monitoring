import { Application } from "@/types/catalogue";

export class ApplicationService {
  private baseUrl: string = "http://localhost:5000";

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
