// "use client";

// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import Topmodel from "./Topmodel";
// import Genbycategory from "./Genbycategory";
// import Costbyenv from "./Costbyenv";
// import Costbyapp from "./Costbyapp";
// import {
//   create_time_frame_query_string,
//   get_time_frame_params,
// } from "@/hooks/TimeFrame/api";
// import { DashboardApiService } from "@/lib/DashboardService/api";

// export default function DashboardCharts() {
//   const [DATA, SET_DATA] = useState<any>(null);
//   const [IS_LOADING, SET_IS_LOADING] = useState(true);
//   const SEARCH_PARAMS = useSearchParams();

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         SET_IS_LOADING(true);
//         const TIME_FRAME_PARAMS = get_time_frame_params(SEARCH_PARAMS);
//         const DATA = await DashboardApiService.get_dashboard_data(
//           TIME_FRAME_PARAMS
//         );
//         console.log("Fetched Data:", DATA);
//         SET_DATA(DATA);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         SET_IS_LOADING(false);
//       }
//     }
//     fetchData();
//   }, [SEARCH_PARAMS]);

//   if (IS_LOADING) return <div>Loading...</div>;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <Topmodel data={DATA?.["Top Model"] || {}} />
//       <Genbycategory data={DATA?.["Gen by category"] || {}} />
//       <Costbyenv data={DATA?.["Cost by env"] || {}} />
//       <Costbyapp data={DATA?.["Cost by app"] || {}} />
//     </div>
//   );
// }
