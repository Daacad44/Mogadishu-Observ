import { Card } from "@/components/ui/card";
import {
  Satellite,
  Database,
  Brain,
} from "lucide-react";

const technologies = [
  { name: "Next.js 15", category: "Frontend" },
  { name: "Supabase", category: "Backend" },
  { name: "Leaflet / MapLibre", category: "GIS" },
  { name: "Google Earth Engine", category: "Satellite" },
  { name: "Scikit-learn", category: "ML" },
  { name: "Vercel", category: "Deployment" },
];

const timeline = [
  { year: "2014", event: "Baseline urban extent mapping initiated" },
  { year: "2018", event: "Sentinel-2 integration for annual analysis" },
  { year: "2021", event: "Building footprint detection pipeline deployed" },
  { year: "2024", event: "AI prediction models trained on 10-year dataset" },
  { year: "2026", event: "Observatory platform launched publicly" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-4">About the Observatory</h1>
        <p className="text-muted-foreground leading-relaxed">
          The Mogadishu Urban Growth Observatory is a professional GIS platform designed
          to monitor, analyze, and predict urban expansion in Somalia&apos;s capital city.
          By combining Sentinel-2 satellite imagery processed through Google Earth Engine
          with machine learning models, the platform provides actionable insights for
          urban planners, researchers, and policymakers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Satellite,
            title: "Satellite Analysis",
            desc: "Sentinel-2 imagery processed yearly to detect built-up area changes across 10 districts.",
          },
          {
            icon: Brain,
            title: "AI Forecasting",
            desc: "Random Forest and Linear Regression models predict expansion through 2030.",
          },
          {
            icon: Database,
            title: "Open Data",
            desc: "GeoJSON layers, statistics, and reports available for download and research.",
          },
        ].map((item, i) => (
          <div className="animate-fade-in-up">
            <Card glass className="glass-card-hover h-full p-6">
              <item.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
        <div className="space-y-4">
          {timeline.map((item, i) => (
            <div className="animate-fade-in-up">
              <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-sm font-bold text-primary shrink-0">
                {item.year}
              </div>
              <p className="text-sm text-muted-foreground pt-2">{item.event}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="flex flex-wrap gap-3">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="glass-card px-4 py-2 text-sm"
            >
              <span className="font-medium">{tech.name}</span>
              <span className="text-muted-foreground ml-2 text-xs">{tech.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
