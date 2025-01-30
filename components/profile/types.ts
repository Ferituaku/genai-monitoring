export type UserRole = 'admin' | 'user' | 'user1';

export interface ProfileData {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
}