import { motion } from "framer-motion";
import { Flame, Expand, AlertTriangle, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const insights = [
  {
    icon: Flame,
    title: "Growth Hotspots",
    description: "Hodan, Wadajir, and Daynile show highest expansion velocity (+6.2% annually).",
    items: ["Hodan District", "Wadajir Corridor", "Daynile Periphery"],
    variant: "default" as const,
    accent: "#00d4aa",
  },
  {
    icon: Expand,
    title: "Expansion Zones",
    description: "Peripheral zones expanding outward along transport corridors and coastal edges.",
    items: ["Northern Belt", "Airport Axis", "Coastal Strip"],
    variant: "secondary" as const,
    accent: "#3b82f6",
  },
  {
    icon: AlertTriangle,
    title: "Risk Zones",
    description: "Informal settlements in flood-prone lowlands require monitoring and mitigation.",
    items: ["Shangani Lowlands", "River Basin", "Coastal Erosion"],
    variant: "secondary" as const,
    accent: "#ef4444",
  },
  {
    icon: Construction,
    title: "Infrastructure Development",
    description: "Road networks and utilities expanding to support new urban clusters.",
    items: ["Ring Road Phase 2", "Port Access", "Power Grid"],
    variant: "outline" as const,
    accent: "#f59e0b",
  },
];

export function GrowthInsights() {
  return (
    <section className="mx-auto max-w-7xl section-padding py-12 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold">Urban Growth Insights</h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl">
          AI-detected patterns from satellite imagery and spatial analysis across Mogadishu districts.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {insights.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 sm:p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                style={{ backgroundColor: `${item.accent}12`, borderColor: `${item.accent}30` }}
              >
                <item.icon className="h-5 w-5" style={{ color: item.accent }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.items.map((tag) => (
                    <Badge key={tag} variant={item.variant} className="text-[10px] font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
