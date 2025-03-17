'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      const expiryDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
      document.cookie = `authData=${JSON.stringify({
        value: token,
        expiry: expiryDate.getTime()
      })}; path=/; expires=${expiryDate.toUTCString()}`;
      router.push('/admin/Dashboard');
    } else {
      router.push('/login');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}