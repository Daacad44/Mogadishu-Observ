import { HeroSection } from "@/components/home/hero-section";
import { KpiCards } from "@/components/home/kpi-cards";
import { GrowthInsights } from "@/components/home/growth-insights";
import { SatelliteComparison } from "@/components/home/satellite-comparison";
import { PredictionDashboard } from "@/components/home/prediction-dashboard";
import { HomeCharts } from "@/components/home/home-charts";

export default function HomePage() {
  return (
    <div className="grid-bg-animated min-h-full">
      <HeroSection />
      <KpiCards />
      <GrowthInsights />
      <SatelliteComparison />
      <PredictionDashboard />
      <HomeCharts />
    </div>
  );
}
