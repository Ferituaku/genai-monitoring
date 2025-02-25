"use client";

interface TokenData {
  value: string;
  expiry: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TIMEZONE_OFFSET = 7; // WIB UTC+7

// Fungsi helper untuk mendapatkan waktu dalam WIB
const getWIBTime = (date: Date = new Date()): Date => {
  // Konversi ke WIB (UTC+7)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * TIMEZONE_OFFSET);
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const clearAllCookies = () => {
  const wibExpiry = getWIBTime();
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + wibExpiry.toUTCString() + ";path=/");
  });
};

export const checkAuth = (): boolean => {
  try {
    const authData = getCookie("authData");
    if (!authData) return false;

    const tokenData: TokenData = JSON.parse(authData);
    if (getWIBTime().getTime() > tokenData.expiry) {
      clearAllCookies();
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const getToken = (): string | null => {
  try {
    const authData = getCookie("authData");
    if (!authData) return null;

    const tokenData: TokenData = JSON.parse(authData);
    if (getWIBTime().getTime() > tokenData.expiry) {
      clearAllCookies();
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
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAllCookies();
      return false;
    }

    const data = await response.json();
    setAuthToken(data.token);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearAllCookies();
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    clearAllCookies();
    localStorage.clear();
    sessionStorage.clear();

    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", "/login");
      window.addEventListener("popstate", function () {
        window.history.pushState(null, "", "/login");
      });
    }

    window.location.replace("/login");
  }
};

export const setAuthToken = (token: string): void => {
  const wibNow = getWIBTime();
  const expiryDate = getWIBTime(
    new Date(wibNow.getTime() + 24 * 60 * 60 * 1000)
  ); // 24 jam dari sekarang dalam WIB

  const tokenData = {
    value: token,
    expiry: expiryDate.getTime(),
  };

  // Format tanggal expires dalam WIB
  document.cookie = `authData=${JSON.stringify(
    tokenData
  )}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
};
