// app/admin/profile/page.tsx
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
    <ProfileEdit role="admin" initialData={initialData} onSave={handleSave} />
  );
}
