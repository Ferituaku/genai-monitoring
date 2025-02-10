'use client';
import { useEffect } from 'react';
import { logout } from '@/lib/auth';

export default function LogoutPage() {
  useEffect(() => {
    logout();
  }, []);
  return null;
}