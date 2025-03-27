"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { User, addUserApi } from "@/lib/UserManagement/api";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddUserDialog = ({ open, onOpenChange, onSuccess }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    sso_id: "",
    role: "user1", // Default role
    created_at: "",
    last_login: ""
  });

  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.name || !newUser.email || !newUser.sso_id) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill all required fields."
        });
        return;
      }
      
      // Set current date and time for created_at and last_login
      const now = new Date();
      const formattedDateTime = now.toISOString().replace('T', ' ').substring(0, 19);
      newUser.created_at = formattedDateTime;
      newUser.last_login = formattedDateTime;

      await addUserApi(newUser);
      
      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        sso_id: "",
        role: "user1",
        created_at: "",
        last_login: ""
      });
      onOpenChange(false);
      onSuccess();
      
      toast({
        title: "Success",
        description: "User has been added successfully!"
      });
    } catch (e) {
      console.error("Error adding user:", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to add user."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account for the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-sso-id" className="text-right">
              SSO ID
            </Label>
            <Input
              id="add-sso-id"
              className="col-span-3"
              value={newUser.sso_id}
              onChange={(e) => setNewUser({...newUser, sso_id: e.target.value})}
              placeholder="Unique identifier for the user"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-name" className="text-right">
              Name
            </Label>
            <Input
              id="add-name"
              className="col-span-3"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-email" className="text-right">
              Email
            </Label>
            <Input
              id="add-email"
              type="email"
              className="col-span-3"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-role" className="text-right">
              Role
            </Label>
            <Select 
              value={newUser.role} 
              onValueChange={(value) => setNewUser({...newUser, role: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user1">User 1</SelectItem>
                <SelectItem value="user2">User 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleAddUser}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;