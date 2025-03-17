import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Application } from "@/types/catalogue";
import {
  Activity,
  CalendarDays,
  Clock,
  Pencil,
  Upload,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { LogoService } from "@/lib/CatalogueService/logo-service";

interface ApplicationCardProps {
  application: Application;
}

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLogoValid, setIsLogoValid] = useState<boolean>(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const logoService = new LogoService();

  // Check if logo exists and set URL on component mount
  useEffect(() => {
    const checkLogo = async () => {
      if (application.HasLogo) {
        const url = logoService.getLogoUrl(application.ProjectName);
        setLogoUrl(url);
        
        // Verify the logo URL is valid
        const isValid = await logoService.isImageUrlValid(url);
        setIsLogoValid(isValid);
      }
    };
    
    checkLogo();
  }, [application.HasLogo, application.ProjectName]);

  // Format date to a readable format
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload logo using LogoService
      const success = await logoService.uploadLogo(application.ProjectName, file);
      
      if (success) {
        // Update logo URL and set as valid
        const newLogoUrl = logoService.getLogoUrl(application.ProjectName);
        
        // Force reload of image by adding timestamp query parameter
        const timestamp = new Date().getTime();
        setLogoUrl(`${newLogoUrl}?t=${timestamp}`);
        setIsLogoValid(true);
        
        // Update the application object locally
        application.HasLogo = true;
        
        // Close the sheet modal
        setIsSheetOpen(false);
        
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle logo deletion
  const handleDeleteLogo = async () => {
    if (!application.HasLogo) return;

    try {
      setIsDeleting(true);
      
      // Delete logo using LogoService
      const success = await logoService.deleteLogo(application.ProjectName);
      
      if (success) {
        setLogoUrl(null);
        setIsLogoValid(false);
        
        // Update the application object locally
        application.HasLogo = false;

        // Close sheet after deletion
        setIsSheetOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Default logo placeholder
  const defaultLogo = (
    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-bold">
      {application.ProjectName?.charAt(0) || "A"}
    </div>
  );

  // Rendered logo
  const logoElement = (isLogoValid && logoUrl) ? (
    <img
      src={logoUrl}
      alt={`${application.ProjectName} logo`}
      className="w-12 h-12 rounded-md object-cover"
      onError={() => setIsLogoValid(false)}
    />
  ) : (
    defaultLogo
  );

  return (
    <Card className="hover:shadow-lg transition-all border-l-blue-500 border-l-[6px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div
            className="relative"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            {logoElement}

            {isLogoHovered && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute inset-1.5 bg-black/30 rounded-md flex items-center justify-center"
                    onClick={() => setIsSheetOpen(true)}
                  >
                    <Pencil className="h-4 w-4 text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Edit App Logo</SheetTitle>
                    <SheetDescription>
                      Upload a new logo for {application.ProjectName}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="my-6 flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {(isLogoValid && logoUrl) ? (
                        <img
                          src={logoUrl}
                          alt={`${application.ProjectName} logo`}
                          className="w-full h-full object-cover"
                          onError={() => setIsLogoValid(false)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl">
                          {application.ProjectName?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 relative"
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{isUploading ? "Uploading..." : (isLogoValid ? "Change Logo" : "Upload Logo")}</span>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </Button>

                      {isLogoValid && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="flex items-center gap-2"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Logo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the logo for {" "}
                                {application.ProjectName} ? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteLogo}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  <SheetFooter>
                    <Button type="button" onClick={() => setIsSheetOpen(false)}>
                      Close
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            )}
          </div>
          <h3 className="text-lg font-semibold">{application.ProjectName}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>
              Total Requests:{" "}
              {application.JumlahRequest?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Created: {formatDate(application.CreatedAt || "")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Last Update: {formatDate(application.LastUpdate || "")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>
              Environment:{" "}
              {application.Environment || "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};