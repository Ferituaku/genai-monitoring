import { toast } from "@/hooks/use-toast";

export class LogoService {
  private API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5101";

  /**
   * Gets the URL for a project logo
   * @param projectName Name of the project
   * @returns URL string for the logo
   */
  getLogoUrl(projectName: string): string {
    return `${this.API_BASE_URL}/api/applogo/${encodeURIComponent(projectName)}`;
  }

  /**
   * Uploads a logo for a project
   * @param projectName Name of the project
   * @param logoFile File object containing the logo image
   */
  async uploadLogo(projectName: string, logoFile: File): Promise<boolean> {
    try {
      // Validate file is an image
      if (!logoFile.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return false;
      }

      // Limit file size to 2MB
      if (logoFile.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must not exceed 2MB",
          variant: "destructive",
        });
        return false;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("logo", logoFile);
      formData.append("project_name", projectName);

      // Upload to backend
      const response = await fetch(`${this.API_BASE_URL}/api/applogo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload logo");
      }

      toast({
        title: "Success",
        description: "Logo saved successfully",
      });

      return true;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Deletes a logo for a project
   * @param projectName Name of the project
   */
  async deleteLogo(projectName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/api/applogo/${encodeURIComponent(projectName)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete logo");
      }

      toast({
        title: "Success",
        description: "Logo deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete logo",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Checks if an image URL is valid
   * @param url URL to check
   * @returns Promise resolving to boolean indicating validity
   */
  async isImageUrlValid(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
}