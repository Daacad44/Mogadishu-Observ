import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { HeroSection } from "@/components/home/hero-section";
import { KpiCards } from "@/components/home/kpi-cards";
import { GrowthInsights } from "@/components/home/growth-insights";
import { SatelliteComparison } from "@/components/home/satellite-comparison";
import { PredictionDashboard } from "@/components/home/prediction-dashboard";
import { InView } from "@/components/ui/in-view";

// Charts pull in recharts (~113 kB gzip). Load it lazily and only once the
// section scrolls into view so it never blocks the initial page load.
const HomeCharts = lazy(() =>
  import("@/components/home/home-charts").then((m) => ({ default: m.HomeCharts }))
);

function ChartsFallback() {
  return (
    <div className="mx-auto max-w-7xl section-padding pb-16">
      <div className="flex h-64 items-center justify-center rounded-2xl border border-glass-border bg-glass">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="grid-bg-animated min-h-full">
      <HeroSection />
      <KpiCards />
      <GrowthInsights />
      <SatelliteComparison />
      <PredictionDashboard />
      <InView fallback={<ChartsFallback />} rootMargin="300px">
        <Suspense fallback={<ChartsFallback />}>
          <HomeCharts />
        </Suspense>
      </InView>
    </div>
  );
}
