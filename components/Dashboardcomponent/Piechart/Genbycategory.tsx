import React from "react";
import ChartComponent from "@/components/ChartComponent";

export default function Genbycategory({ data }: { data: any }) {
  return <ChartComponent title="Gen by Category" data={data} />;
}
