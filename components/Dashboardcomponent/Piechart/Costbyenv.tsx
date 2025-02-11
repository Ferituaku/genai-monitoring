import React from "react";
import ChartComponent from "@/components/ChartComponent";

export default function Costbyenv({ data }: { data: any }) {
  return <ChartComponent title="Cost by Env" data={data} />;
}
