import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-transparent to-background/80" />
      <div className="relative mx-auto max-w-7xl section-padding py-16 sm:py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Globe className="h-3.5 w-3.5" />
            Smart City GIS Platform
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Mogadishu Urban Growth{" "}
            <span className="gradient-text">Observatory</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            AI-Powered Urban Expansion Analysis using Satellite Imagery and GIS Technology
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button size="lg" asChild className="shadow-lg shadow-primary/20">
              <Link to="/prediction">
                Explore Predictions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-glass-border">
              <Link to="/reports">
                <FileText className="h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
