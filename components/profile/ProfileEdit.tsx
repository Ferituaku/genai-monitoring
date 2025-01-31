// components/profile/ProfileEdit.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileData, UserRole } from "./types";
import { ProfileGeneral } from "./ProfileGeneral";
import { ProfileSecurity } from "./ProfileSecurity";

interface ProfileEditProps {
  role: UserRole;
  initialData?: ProfileData;
  onSave?: (data: ProfileData) => void;
}

export const ProfileEdit = ({
  role,
  initialData,
  onSave,
}: ProfileEditProps) => {
  return (
    <div className="container left-0 p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Profile Settings
            {/* <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({role.charAt(0).toUpperCase() + role.slice(1)})
            </span> */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <ProfileGeneral initialData={initialData} onSave={onSave} />
            </TabsContent>

            <TabsContent value="security">
              <ProfileSecurity />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
