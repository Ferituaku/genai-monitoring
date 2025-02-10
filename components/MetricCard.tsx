import React, { useState } from "react";

const MetricCard: React.FC<{
  title: string;
  value: string | React.ReactNode;
  subValue: string;
  icon: React.ReactNode;
}> = ({ title, value, icon, subValue }) => {
  return (
    <div className="rounded-2xl bg-white shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-slate-600 text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-slate-600">{value}</div>
      {subValue && (
        <div className="text-slate-400 text-sm mt-2">{subValue}</div>
      )}
    </div>
  );
};
export default MetricCard;
