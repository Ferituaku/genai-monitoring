"use client";

import React, { useState, useEffect } from "react";

export default function Avgduration() {
  const [avg_duration, setavg_duration] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Data:", data);
        setavg_duration(data.avg_duration);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  if (avg_duration === null) {
    return <span>Loading...</span>;
  }

  return <>{avg_duration.toString()}</>; // Hanya mengembalikan nilai
}
