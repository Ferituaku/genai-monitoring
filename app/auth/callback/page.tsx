'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      // Set expiry time
      const tokenData = {
        value: token,
        expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('authData', JSON.stringify(tokenData));
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