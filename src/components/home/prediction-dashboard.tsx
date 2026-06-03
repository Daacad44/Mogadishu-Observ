import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Map, Users, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const predictions = [
  {
    icon: Brain,
    title: "Growth Forecast",
    value: "+18.4%",
    subtitle: "Projected urban area increase by 2026",
    progress: 72,
    color: "#00d4aa",
  },
  {
    icon: Map,
    title: "Urban Heatmap",
    value: "3 Zones",
    subtitle: "High-intensity expansion corridors identified",
    progress: 85,
    color: "#3b82f6",
  },
  {
    icon: Users,
    title: "Population Projection",
    value: "2.8M",
    subtitle: "Estimated metropolitan population 2026",
    progress: 68,
    color: "#8b5cf6",
  },
  {
    icon: Wrench,
    title: "Infrastructure Demand",
    value: "High",
    subtitle: "Roads, water, and power capacity gaps",
    progress: 91,
    color: "#f59e0b",
  },
];

export function PredictionDashboard() {
  return (
    <section className="mx-auto max-w-7xl section-padding py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Prediction Dashboard</h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl">
            Machine learning forecasts powered by Sentinel-2 imagery and historical growth patterns.
          </p>
        </div>
        <Button variant="outline" asChild className="shrink-0">
          <Link to="/prediction">
            Full Predictions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {predictions.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border"
                style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}
              >
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{item.title}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>
            <Progress value={item.progress} className="h-1.5" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
