// app/admin/profile/page.tsx
import DynamicBreadcrumb from "@/components/Breadcrum";
import { ProfileEdit } from "@/components/profile/ProfileEdit";

export default function AdminProfilePage() {
  const initialData = {
    fullName: "Admin User",
    email: "admin@example.com",
    phone: "083489324",
    address: "123 Admin Street",
  };

  const handleSave = (data: any) => {
    console.log("Saving admin profile:", data);
  };

  return (
    <>
      <div className="min-h-screen">
        <div className="top-0 p-2">
          <DynamicBreadcrumb />
        </div>
        <ProfileEdit
          role="admin"
          initialData={initialData}
          onSave={handleSave}
        />
      </div>
    </>
  );
}
