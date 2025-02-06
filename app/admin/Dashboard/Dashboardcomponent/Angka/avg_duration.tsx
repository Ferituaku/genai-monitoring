"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Avgduration() {
  const [avgduration, setavgduration] = useState(0);
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
        setavgduration(data?.avg_prompt_tokens ?? 0);
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

  return <>{avgduration.toString()}</>; // Menampilkan nilai avgduration
}
