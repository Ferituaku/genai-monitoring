import React from "react";
import ChartComponent from "@/components/ChartComponent";

export default function TopModel({ data }: { data: any }) {
  return <ChartComponent title="Top Model" data={data} />;
}
