import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { GrowthAreaChart, GrowthRateChart } from "@/components/dashboard/charts";
import { useStatistics } from "@/hooks/use-growth-data";

const landUseData = [
  { name: "Built-up", value: 42, color: "#00d4aa" },
  { name: "Vegetation", value: 18, color: "#22c55e" },
  { name: "Bare Land", value: 22, color: "#78716c" },
  { name: "Water", value: 8, color: "#3b82f6" },
  { name: "Informal", value: 10, color: "#f59e0b" },
];

const populationData = [
  { year: 2014, growth: 1.2 },
  { year: 2016, growth: 2.1 },
  { year: 2018, growth: 2.8 },
  { year: 2020, growth: 3.4 },
  { year: 2022, growth: 3.9 },
  { year: 2024, growth: 4.2 },
  { year: 2026, growth: 4.8 },
];

export function HomeCharts() {
  const { data: stats } = useStatistics();

  const areaData =
    stats?.yearlyTrend?.map((y) => ({
      year: y.year,
      area: y.area,
      growth: y.growth,
    })) ?? [
      { year: 2014, area: 98, growth: 1.2 },
      { year: 2016, area: 105, growth: 2.1 },
      { year: 2018, area: 112, growth: 2.8 },
      { year: 2020, area: 121, growth: 3.4 },
      { year: 2022, area: 131, growth: 3.9 },
      { year: 2024, area: 138, growth: 4.2 },
      { year: 2026, area: 143, growth: 4.8 },
    ];

  return (
    <section className="mx-auto max-w-7xl section-padding py-12 sm:py-16 pb-16 sm:pb-20">
      <div className="mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold">Analytics Overview</h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Temporal trends and land use distribution across the study period.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-5 sm:p-6"
        >
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
            Area Growth Chart
          </h3>
          <GrowthAreaChart data={areaData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 sm:p-6"
        >
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
            Population Growth Chart
          </h3>
          <GrowthRateChart data={populationData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 sm:p-6 lg:col-span-2"
        >
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
            Land Use Distribution
          </h3>
          <div className="h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={landUseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {landUseData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    borderRadius: "8px",
                    color: "#e8edf5",
                  }}
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
