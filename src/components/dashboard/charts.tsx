import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface GrowthChartProps {
  data: { year: number; area: number; growth: number }[];
}

export function GrowthAreaChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis
          dataKey="year"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "8px",
            color: "#e8edf5",
          }}
        />
        <Area
          type="monotone"
          dataKey="area"
          stroke="#00d4aa"
          strokeWidth={2}
          fill="url(#areaGradient)"
          name="Built-up Area (km²)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface DistrictChartProps {
  data: { name: string; area: number; density: number; growth: number }[];
}

export function DistrictBarChart({ data }: DistrictChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={11}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "8px",
            color: "#e8edf5",
          }}
        />
        <Legend />
        <Bar dataKey="area" fill="#00d4aa" name="Area (km²)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="density" fill="#3b82f6" name="Density (/km²)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface GrowthRateChartProps {
  data: { year: number; growth: number }[];
}

export function GrowthRateChart({ data }: GrowthRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "8px",
            color: "#e8edf5",
          }}
        />
        <Bar
          dataKey="growth"
          fill="#3b82f6"
          name="Growth Rate (%)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
