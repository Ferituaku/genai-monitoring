"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Avgtoken() {
  const [avgtoken, setavgtoken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const days = searchParams.get("days"); // Mengambil nilai 'days' dari URL

  useEffect(() => {
    async function fetchData() {
      if (!days) return; // Jangan fetch kalau 'days' tidak ada

      setIsLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Data:", data);
        setavgtoken(data?.avg_token ?? 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [days]);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return <>{avgtoken.toString()}</>; // Menampilkan nilai avgtoken
}
