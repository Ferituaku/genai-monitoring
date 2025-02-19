  import React from "react";
  import ChartComponent from "@/components/ChartComponent";

  export default function Costbyapp({ data }: { data: any }) {
    console.log("Cost by App Data:", data); // Debugging data di frontend
    return <ChartComponent title="Cost by App" data={data} />;
  }
