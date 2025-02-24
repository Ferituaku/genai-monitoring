export type UserRole = "admin" | "user1" | "user2";

export interface ProfileData {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
}
