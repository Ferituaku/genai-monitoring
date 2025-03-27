"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { User, deleteUserApi } from "@/lib/UserManagement/api";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

const DeleteUserDialog = ({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) => {
  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      await deleteUserApi(user.sso_id);
      onOpenChange(false);
      onSuccess();
      
      toast({
        title: "Success",
        description: "User has been deleted successfully!"
      });
    } catch (e) {
      console.error("Error deleting user:", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete user."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the user {user?.name}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;