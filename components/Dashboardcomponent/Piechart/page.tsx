"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TopModel from "./TopModel";
import Genbycategory from "./Genbycategory";
import Costbyenv from "./Costbyenv";
import Costbyapp from "./Costbyapp";

export default function DashboardCharts() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const days = searchParams.get("days");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/dashboard?days=${days}`);
        const result = await response.json();
        console.log("Fetched Data:", result);
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [days]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TopModel data={data?.["Top Model"] || {}} />
      <Genbycategory data={data?.["Gen by category"] || {}} />
      <Costbyenv data={data?.["Cost by env"] || {}} />
      <Costbyapp data={data?.["Cost by app"] || {}} />
    </div>
  );
}
