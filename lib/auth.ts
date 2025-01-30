'use client';

export const checkAuth = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') !== null;
  }
  return false;
};
