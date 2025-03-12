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

  /**
   * Mengunggah logo untuk aplikasi tertentu
   * @param appId ID aplikasi
   * @param logoFile File logo yang akan diunggah
   * @returns Promise dengan URL logo yang berhasil diunggah
   */
  async uploadLogo(appId: string, logoFile: File): Promise<{ logoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      formData.append("appId", appId);

      const response = await fetch(`${this.API_BASE_URL}/api/upload-logo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  }

  /**
   * Menghapus logo untuk aplikasi tertentu
   * @param appId ID aplikasi
   * @returns Promise dengan status keberhasilan operasi
   */
  async deleteLogo(appId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/delete-logo/${appId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting logo:", error);
      throw error;
    }
  }
}