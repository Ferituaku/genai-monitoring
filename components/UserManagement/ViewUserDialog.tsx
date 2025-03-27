"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { User } from "@/lib/UserManagement/api";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const ViewUserDialog = ({ open, onOpenChange, user }: ViewUserDialogProps) => {
  // Format date untuk tampilan yang lebih baik
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    
    try {
      // Mencoba memparse berbagai format tanggal yang mungkin
      const date = new Date(dateString);
      
      // Mengecek apakah tanggal valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format tanggal: DD/MM/YYYY HH:MM
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      // Kembalikan string asli jika terjadi kesalahan
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center">
            <div className="w-32 flex-shrink-0 text-right font-semibold text-gray-500 mr-4">
              SSO ID:
            </div>
            <div>{user?.sso_id}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 flex-shrink-0 text-right font-semibold text-gray-500 mr-4">
              Name:
            </div>
            <div>{user?.name}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 flex-shrink-0 text-right font-semibold text-gray-500 mr-4">
              Email:
            </div>
            <div>{user?.email}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 flex-shrink-0 text-right font-semibold text-gray-500 mr-4">
              Role:
            </div>
            <div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user?.role === "admin" 
                  ? "bg-blue-100 text-blue-800" 
                  : user?.role === "user1"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-32 flex-shrink-0 text-right font-semibold text-gray-500 mr-4">
              Created At:
            </div>
            <div className="text-sm text-gray-600">{formatDate(user?.created_at)}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 flex-shrink-0 text-right font-semibold text-gray-500 mr-4">
              Last Login:
            </div>
            <div className="text-sm text-gray-600">{formatDate(user?.last_login)}</div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button" 
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDialog;