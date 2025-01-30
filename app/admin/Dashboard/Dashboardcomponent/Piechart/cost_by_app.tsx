"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];

export default function Costbyapp() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        const data = await response.json();
        console.log("Fetched Data:", data);

        // Format ulang data agar sesuai dengan format pie chart
        const formattedData = Object.entries(data).map(([key, value]: any) => ({
          name: value[0], // Nama aplikasi
          value: parseFloat(value[1]), // Konversi string persentase ke angka
        }));

        setChartData(formattedData);
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
    <div className="min-h-screen p-2 flex justify-center items-center">
      <ResponsiveContainer width={400} height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60} // Membuat pie chart bulat penuh
            outerRadius="100%" // Mengisi ruang yang tersedia
            paddingAngle={2}
            dataKey="value"
            label={false} // Menghilangkan label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
