import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const IMAGERY = {
  before: {
    year: 2014,
    label: "2014 Imagery",
    gradient: "from-slate-900 via-slate-800 to-emerald-950",
    pattern: "radial-gradient(circle at 30% 40%, rgba(0,212,170,0.15) 0%, transparent 50%)",
  },
  after: {
    year: 2026,
    label: "2026 Prediction",
    gradient: "from-slate-900 via-blue-950 to-emerald-900",
    pattern: "radial-gradient(circle at 70% 60%, rgba(59,130,246,0.2) 0%, transparent 50%)",
  },
};

export function SatelliteComparison() {
  const [pos, setPos] = useState(50);

  return (
    <section className="mx-auto max-w-7xl section-padding py-12 sm:py-16">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Satellite className="h-5 w-5 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">Satellite Imagery Comparison</h2>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Compare urban expansion from 2014 baseline through 2020 to 2026 AI prediction.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-card p-4 sm:p-6"
      >
        <div
          className="comparison-slider border border-glass-border"
          style={{ "--pos": `${pos}%` } as React.CSSProperties}
        >
          {/* Before (2014) */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${IMAGERY.before.gradient}`}
            style={{ backgroundImage: IMAGERY.before.pattern }}
          >
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute bottom-4 left-4 glass-card px-3 py-1.5 text-xs font-medium">
              {IMAGERY.before.label}
            </div>
            {/* Simulated urban clusters */}
            <div className="absolute top-[35%] left-[25%] w-24 h-16 rounded-lg bg-primary/20 border border-primary/30 blur-sm" />
            <div className="absolute top-[50%] left-[40%] w-32 h-20 rounded-lg bg-primary/15 border border-primary/20 blur-sm" />
          </div>

          {/* After (2026) */}
          <div
            className={`comparison-after absolute inset-0 bg-gradient-to-br ${IMAGERY.after.gradient}`}
            style={{ backgroundImage: IMAGERY.after.pattern }}
          >
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute bottom-4 right-4 glass-card px-3 py-1.5 text-xs font-medium">
              {IMAGERY.after.label}
            </div>
            <div className="absolute top-[30%] left-[22%] w-28 h-20 rounded-lg bg-primary/30 border border-primary/40 blur-sm" />
            <div className="absolute top-[45%] left-[38%] w-40 h-28 rounded-lg bg-accent/25 border border-accent/35 blur-sm" />
            <div className="absolute top-[55%] left-[55%] w-24 h-16 rounded-lg bg-primary/20 border border-primary/30 blur-sm" />
          </div>

          {/* Divider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_12px_rgba(0,212,170,0.6)] z-10 pointer-events-none"
            style={{ left: `${pos}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 h-10 w-10 rounded-full bg-primary border-2 border-background shadow-lg flex items-center justify-center pointer-events-none"
            style={{ left: `${pos}%` }}
          >
            <span className="text-primary-foreground text-xs font-bold">⟷</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>2014</span>
            <span>2020</span>
            <span>2026 Prediction</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[pos]}
            onValueChange={([v]) => setPos(v)}
          />
        </div>
      </motion.div>
    </section>
  );
}
