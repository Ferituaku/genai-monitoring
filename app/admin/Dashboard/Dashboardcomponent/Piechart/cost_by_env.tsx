"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];

export default function Costbyenv() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:5000/dashboard");
        const data = await response.json();
        console.log("Fetched Data:", data);

        // Format ulang data untuk pie chart
        if (data["cost by env"]) {
          const categoryData = data["cost by env"];
          const formattedData = Object.entries(categoryData).map(([key, value]: any) => ({
            name: value[0], // Mengambil nama (e.g., "Chat", "Embedding")
            value: parseFloat(value[1].replace("%", "")), // Mengkonversi "94.55%" menjadi 94.55
          }));

          console.log("Formatted Data:", formattedData);
          setChartData(formattedData);
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

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="aspect-square relative scale-75">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              name,
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#000"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  className="text-xs"
                >
                  {`${name} (${value.toFixed(1)}%)`}
                </text>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}