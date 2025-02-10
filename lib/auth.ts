'use client';

interface TokenData {
  value: string;
  expiry: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const checkAuth = (): boolean => {
  try {
    const authData = getCookie('authData');
    if (!authData) return false;
    
    const tokenData: TokenData = JSON.parse(authData);
    if (new Date().getTime() > tokenData.expiry) {
      document.cookie = 'authData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const getToken = (): string | null => {
  try {
    const authData = getCookie('authData');
    if (!authData) return null;

    const tokenData: TokenData = JSON.parse(authData);
    if (new Date().getTime() > tokenData.expiry) {
      document.cookie = 'authData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      return null;
    }
    return tokenData.value;
  } catch {
    return null;
  }
};

export const refreshToken = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      document.cookie = 'authData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      return false;
    }

    const data = await response.json();
    setAuthToken(data.token);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    document.cookie = 'authData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    document.cookie = 'authData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.href = '/login';
  }
};

export const setAuthToken = (token: string): void => {
  const tokenData = {
    value: token,
    expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
  };
  document.cookie = `authData=${JSON.stringify(tokenData)}; path=/`;
};