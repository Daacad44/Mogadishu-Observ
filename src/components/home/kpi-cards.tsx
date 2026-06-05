import { motion } from "framer-motion";
import { Layers, TrendingUp, Users, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { useStatistics } from "@/hooks/use-growth-data";
import { cn } from "@/lib/utils";

// Lightweight inline SVG sparkline — avoids pulling recharts (~113 kB gzip)
// onto the above-the-fold critical path. Data is static.
const SPARK_VALUES = [12, 14, 13, 16, 18, 17, 21, 24];

function Sparkline({ color, id }: { color: string; id: string }) {
  const min = Math.min(...SPARK_VALUES);
  const max = Math.max(...SPARK_VALUES);
  const range = max - min || 1;
  const n = SPARK_VALUES.length;
  const points = SPARK_VALUES.map((v, i) => {
    const x = (i / (n - 1)) * 100;
    const y = 90 - ((v - min) / range) * 80;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

interface KpiItemProps {
  title: string;
  value: number;
  suffix?: string;
  decimals?: number;
  trend: number;
  icon: typeof Layers;
  color: string;
  delay?: number;
}

function KpiCard({ title, value, suffix = "", decimals = 1, trend, icon: Icon, color, delay = 0 }: KpiItemProps) {
  const animated = useCountUp(value, 1400, decimals);
  const positive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card glass-card-hover p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
            {animated.toLocaleString()}{suffix}
          </p>
          <div className={cn("flex items-center gap-1 text-xs font-medium", positive ? "text-primary" : "text-destructive")}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {positive ? "+" : ""}{trend.toFixed(1)}% vs 2020
          </div>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <div className="h-12 -mx-1">
        <Sparkline color={color} id={`spark-${title.replace(/\s+/g, "-")}`} />
      </div>
    </motion.div>
  );
}

export function KpiCards() {
  const { data: stats } = useStatistics();

  const kpis = [
    {
      title: "Total Urban Area",
      value: stats?.totalBuiltUpArea ?? 142.8,
      suffix: " km²",
      decimals: 1,
      trend: stats?.totalGrowthRate ?? 4.2,
      icon: Layers,
      color: "#00d4aa",
    },
    {
      title: "Growth Rate",
      value: stats?.totalGrowthRate ?? 4.2,
      suffix: "%",
      decimals: 1,
      trend: 1.8,
      icon: TrendingUp,
      color: "#3b82f6",
    },
    {
      title: "Population Density",
      value: stats?.avgDensity ?? 1240,
      suffix: "/km²",
      decimals: 0,
      trend: 3.1,
      icon: Users,
      color: "#8b5cf6",
    },
    {
      title: "Built-up Coverage",
      value: 68.4,
      suffix: "%",
      decimals: 1,
      trend: 5.6,
      icon: Building2,
      color: "#f59e0b",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl section-padding pb-12 sm:pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.title} {...kpi} delay={i * 0.08} />
        ))}
      </div>
    </section>
  );
}
