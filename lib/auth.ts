'use client';

interface TokenData {
  value: string;
  expiry: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const authData = localStorage.getItem('authData');
  if (!authData) return false;

  try {
    const tokenData: TokenData = JSON.parse(authData);
    if (new Date().getTime() > tokenData.expiry) {
      localStorage.removeItem('authData');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('authData');
    return false;
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const authData = localStorage.getItem('authData');
  if (!authData) return null;

  try {
    const tokenData: TokenData = JSON.parse(authData);
    if (new Date().getTime() > tokenData.expiry) {
      localStorage.removeItem('authData');
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
      localStorage.removeItem('authData');
      return false;
    }

    const data = await response.json();
    const tokenData = {
      value: data.token,
      expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
    };
    localStorage.setItem('authData', JSON.stringify(tokenData));
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('authData');
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
    localStorage.removeItem('authData');
    window.location.href = '/login';
  }
};

export const setAuthToken = (token: string): void => {
  const tokenData = {
    value: token,
    expiry: new Date().getTime() + (24 * 60 * 60 * 1000)
  };
  localStorage.setItem('authData', JSON.stringify(tokenData));
};