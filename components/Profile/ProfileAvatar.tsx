// components/profile/ProfileAvatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl?: string;
  fullName?: string;
}

export const ProfileAvatar = ({ avatarUrl, fullName }: ProfileAvatarProps) => {
  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary/10">
            {/* {fullName?.charAt(0) || 'U'} */}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Change Photo
        </Button>
      </div>
    </div>
  );
};
