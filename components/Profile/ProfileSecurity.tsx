import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const ProfileSecurity = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Password</label>
        <div className="relative">
          <Input
            type="password"
            placeholder="Enter current password"
            className="pl-10"
          />
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">New Password</label>
        <div className="relative">
          <Input
            type="password"
            placeholder="Enter new password"
            className="pl-10"
          />
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm New Password</label>
        <div className="relative">
          <Input
            type="password"
            placeholder="Confirm new password"
            className="pl-10"
          />
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline">
          Cancel
        </Button>
        <Button>
          Update Password
        </Button>
      </div>
    </div>
  );
};
