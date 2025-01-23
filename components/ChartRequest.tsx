import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartCardProps {
  title: string;
  data: { name: string; success: number; error: number }[];
  onDetailClick?: () => void;
}

const ChartRequest: React.FC<ChartCardProps> = ({
  title,
  data,
  onDetailClick,
}) => {
  return (
    <div className="rounded-2xl shadow-md bg-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-800 text-sm">{title}</h3>
        {onDetailClick && (
          <button
            onClick={onDetailClick}
            className="text-slate-800 text-sm hover:text-primary"
          >
            View Detail
          </button>
        )}
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "0.5rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="success"
              stroke="#4ade80"
              fillOpacity={1}
              fill="url(#colorSuccess)"
            />
            <Area
              type="monotone"
              dataKey="error"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorError)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartRequest;
