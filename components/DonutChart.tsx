import { Card, CardContent, CardHeader } from "./ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const DonutChart: React.FC<{
  data: BigInteger;
  title: string;
}> = ({ data, title }) => {
  return (
    <div className="rounded-2xl bg-white shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-600 text-sm">{title}</h3>
        <button className="text-slate-600 text-sm hover:text-primary">
          View Detail
        </button>
      </div>
      <div className="flex justify-center items-center h-40">
        <div className="radial-progress text-primary" style={{ "--value": 70 }}>
          70%
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-slate-600 text-sm">Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red"></div>
          <span className="text-slate-600 text-sm">Processing</span>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
