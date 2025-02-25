export type UserRole = "admin" | "user";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  roles?: UserRole[];
}
