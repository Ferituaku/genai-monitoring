"use client";

import React, { useState, useEffect } from "react";

export default function Avgcompletiontokens() {
  const [avg_completion_tokens, setavg_completion_tokens] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Data:", data);
        
        // Pastikan data yang diterima ada dan valid
        setavg_completion_tokens(data.avg_completion_tokens || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setavg_completion_tokens(null); // Set ke null jika ada error
      }
    }
    fetchData();
  }, []);

  // Menampilkan loading jika data masih null
  if (avg_completion_tokens === null) {
    return <span>Loading...</span>;
  }

  return <>{avg_completion_tokens.toString()}</>; // Mengembalikan nilai yang sudah diubah menjadi string
}
