"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Avgprompttokens() {
  const [avg_prompt_tokens, setavg_prompt_tokens] = useState(0);
  const searchParams = useSearchParams();  // Mengambil query parameter dari URL

  // Mendapatkan nilai 'days' dari parameter query URL
  const days = searchParams.get("days");  

  useEffect(() => {
    async function fetchData() {
      if (days) {
        try {
          // Melakukan request dengan menyertakan 'days' sebagai query parameter
          const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched Data:", data);
          setavg_prompt_tokens(data.avg_prompt_tokens);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }

    fetchData();
  }, [days]);  // Fetch data lagi jika parameter 'days' berubah

  if (avg_prompt_tokens === null) {
    return <span>Loading...</span>;
  }

  return <>{avg_prompt_tokens.toString()}</>; // Menampilkan nilai total requests
}
