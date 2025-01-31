import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { ProfileData } from "./types";

interface ProfileGeneralProps {
  initialData?: ProfileData;
  onSave?: (data: ProfileData) => void;
}

export const ProfileGeneral = ({
  initialData,
  onSave,
}: ProfileGeneralProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <div className="relative">
          <Input
            defaultValue={initialData?.fullName}
            placeholder="Enter your full name"
            className="pl-10"
          />
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <div className="relative">
          <Input
            type="email"
            defaultValue={initialData?.email}
            placeholder="Enter your email"
            className="pl-10"
          />
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <div className="relative">
          <Input
            type="tel"
            defaultValue={initialData?.phone}
            placeholder="Enter your phone number"
            className="pl-10"
          />
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <div className="relative">
          <Input
            defaultValue={initialData?.address}
            placeholder="Enter your address"
            className="pl-10"
          />
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};
