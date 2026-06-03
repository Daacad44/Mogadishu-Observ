import { Link } from "react-router-dom";
import { Satellite, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="shrink-0 mt-auto border-t border-glass-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Satellite className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Mogadishu Urban Growth Observatory</p>
                <p className="text-xs text-muted-foreground">2014–2026 Analysis Platform</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Professional GIS platform for urban expansion analysis using satellite imagery,
              spatial analytics, and machine learning.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/map" className="hover:text-primary transition-colors">GIS Map</Link></li>
              <li><Link to="/prediction" className="hover:text-primary transition-colors">Predictions</Link></li>
              <li><Link to="/reports" className="hover:text-primary transition-colors">Reports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /> Mogadishu, Somalia</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /> <Link to="/contact" className="hover:text-primary">Get in touch</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-glass-border flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Mogadishu Urban Growth Observatory</p>
          <p>Vite · React · Supabase · Leaflet</p>
        </div>
      </div>
    </footer>
  );
}
