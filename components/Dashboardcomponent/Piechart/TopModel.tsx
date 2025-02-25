import React from "react";
import ChartComponent from "@/components/ChartComponent";

export default function Topmodel({ data }: { data: any }) {
  return <ChartComponent title="Top Model" data={data} />;
}
