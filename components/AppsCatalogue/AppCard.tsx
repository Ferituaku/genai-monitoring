import { useState } from "react";
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

interface ApplicationCardProps {
  application: Application;
}

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // Check if file is an image
  //   if (!file.type.startsWith("image/")) {
  //     toast({
  //       title: "Error",
  //       description: "Please upload an image file",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Check file size (max 2MB)
  //   if (file.size > 2 * 1024 * 1024) {
  //     toast({
  //       title: "Error",
  //       description: "File size should be less than 2MB",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     setIsUploading(true);

  //     // Create form data
  //     const formData = new FormData();
  //     formData.append("logo", file);
  //     formData.append("appId", application.id || ""); // Assuming application has an id

  //     // Upload to Flask backend
  //     const response = await fetch("http://localhost:5000/api/upload-logo", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to upload logo");
  //     }

  //     const data = await response.json();
  //     setLogo(data.logoUrl);

  //     toast({
  //       title: "Success",
  //       description: "Logo uploaded successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error uploading logo:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to upload logo. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // Handle logo deletion
  // const handleDeleteLogo = async () => {
  //   if (!logo) return;

  //   try {
  //     setIsDeleting(true);

  //     const response = await fetch(
  //       `http://localhost:5000/api/delete-logo/${application.id}`,
  //       {
  //         method: "DELETE",
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to delete logo");
  //     }

  //     setLogo(null);

  //     toast({
  //       title: "Success",
  //       description: "Logo deleted successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting logo:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete logo. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  // Default logo placeholder
  const defaultLogo = (
    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-bold">
      {application.ProjectName?.charAt(0) || "A"}
    </div>
  );

  // Rendered logo
  const logoElement = logo ? (
    <img
      src={logo}
      alt={`${application.ProjectName} logo`}
      className="w-12 h-12 rounded-md object-cover"
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute inset-1.5 bg-black/30 rounded-md flex items-center justify-center"
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
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${application.ProjectName} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        defaultLogo
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload New Logo</span>
                        <input
                          type="file"
                          className="inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          // onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </Button>

                      {logo && (
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
                                Are you sure you want to delete the logo for{" "}
                                {application.ProjectName}? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  <SheetFooter>
                    <Button type="submit" form="logoForm">
                      Save changes
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
              Last Update Environment:{" "}
              {application.Environment?.toLocaleString() || "0"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
