"use client";

import React, { useState, useEffect } from "react";

export default function Totalrequests() {
  const [total_requests, settotal_requests] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Data:", data);
        settotal_requests(data.total_requests);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  if (total_requests === null) {
    return <span>Loading...</span>;
  }

  return <>{total_requests.toString()}</>; // Hanya mengembalikan nilai
}
