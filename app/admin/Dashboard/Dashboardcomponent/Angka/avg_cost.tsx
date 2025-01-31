"use client";

import React, { useState, useEffect } from "react";

export default function Avgcost() {
    const [avg_cost, setavg_cost] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Data:", data);
        setavg_cost(data.avg_cost);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  if (avg_cost === null) {
    return <span>Loading...</span>;
  }

  return <>{avg_cost.toString()}</>; // Hanya mengembalikan nilai
}
