import { Application } from "@/types/catalogue";

export class ApplicationService {
  private API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  async get_applications(): Promise<Application[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/appcatalogue`);
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
