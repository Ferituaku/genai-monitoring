"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RequestData {
  ok: number;
  unset: number;
  error: number;
}

interface StatsData {
  Prompt_Error: number;
  Prompt_OK: number;
  Prompt_Unset: number;
}

export default function Requestpertime() {
  const [requestData, setRequestData] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        const data: StatsData = await response.json();
        console.log("Fetched Data:", data);

        if (data?.Prompt_Error !== undefined && data?.Prompt_OK !== undefined && data?.Prompt_Unset !== undefined) {
          // Create multiple data points for better visualization
          const dataPoints = [
            {
              name: 'Masi data total harusnya dibuat perhari gt',
              ok: data.Prompt_OK,
              unset: data.Prompt_Unset,
              error: data.Prompt_Error,
            },
          ];

          setRequestData(dataPoints);
        } else {
          console.error("Data tidak sesuai format yang diharapkan");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={requestData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ok" stroke="#82ca9d" name="OK" />
          <Line type="monotone" dataKey="unset" stroke="#8884d8" name="Unset" />
          <Line type="monotone" dataKey="error" stroke="#ff4d4f" name="Error" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}