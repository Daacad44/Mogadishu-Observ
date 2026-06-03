import { TimelineSlider } from "@/components/map/timeline-slider";
import { LayerTogglePanel } from "@/components/map/layer-toggle";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, MapPin, BarChart3, AlertTriangle } from "lucide-react";
import { useDistricts } from "@/hooks/use-admin-data";
import { cn } from "@/lib/utils";

interface MapControlPanelProps {
  year: number;
  onYearChange: (y: number) => void;
  layers: { id: string; name: string; visible: boolean }[];
  onToggleLayer: (id: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  selectedDistrict: string | null;
  onSelectDistrict: (code: string | null) => void;
  collapsed?: boolean;
}

function getDistrictStats(code: string | null, districts: { code?: string | null; name: string; area_km2?: number | null; population?: number | null }[]) {
  if (!code) return null;
  const d = districts.find((x) => x.code === code);
  if (!d) return null;
  const growth = 3.2 + (d.area_km2 ?? 10) * 0.08;
  const risk = growth > 5 ? "High" : growth > 3.5 ? "Medium" : "Low";
  return { district: d, growth, risk };
}

export function MapControlPanel({
  year,
  onYearChange,
  layers,
  onToggleLayer,
  search,
  onSearchChange,
  selectedDistrict,
  onSelectDistrict,
  collapsed = false,
}: MapControlPanelProps) {
  const { data: districts = [] } = useDistricts();
  const filtered = districts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  );

  const activeLayers = layers.filter((l) => l.visible).length;
  const stats = getDistrictStats(selectedDistrict, districts);

  const handleSearch = (value: string) => {
    onSearchChange(value);
    const coordMatch = value.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      // Coordinates search — parent handles fly-to via selectedDistrict reset
      return;
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-l border-glass-border bg-background/95 backdrop-blur-xl transition-all duration-300 h-full",
        collapsed ? "w-0 overflow-hidden border-0" : "w-full sm:w-80 lg:w-[340px]"
      )}
    >
      <div className="p-4 border-b border-glass-border space-y-1 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">GIS Analytics Panel</h2>
          <Badge variant="secondary" className="text-[10px] font-mono">
            {activeLayers} layers
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Layer management · Timeline · District analytics
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Search District / Coordinates
          </label>
          <Input
            placeholder="District, village, or lat, lng..."
            className="h-9 text-sm"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="max-h-32 overflow-y-auto space-y-0.5 rounded-lg border border-border/50 p-1">
            {(search ? filtered : districts.slice(0, 6)).map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => onSelectDistrict(selectedDistrict === d.code ? null : d.code!)}
                className={cn(
                  "w-full text-left text-xs px-2.5 py-2 rounded-md transition-colors flex items-center justify-between",
                  selectedDistrict === d.code
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {d.name}
                </span>
                <span className="text-[10px] opacity-70">{d.area_km2} km²</span>
              </button>
            ))}
          </div>
        </div>

        {/* District analytics */}
        <div className="gis-panel p-4 space-y-3">
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Selected District
          </p>
          {stats ? (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold">{stats.district.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{stats.district.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Area</p>
                  <p className="text-sm font-bold">{stats.district.area_km2} km²</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Population</p>
                  <p className="text-sm font-bold">{stats.district.population?.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">Growth %</p>
                  <p className="text-sm font-bold text-primary">+{stats.growth.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Risk
                  </p>
                  <p className={cn(
                    "text-sm font-bold",
                    stats.risk === "High" ? "text-destructive" : stats.risk === "Medium" ? "text-amber-400" : "text-primary"
                  )}>
                    {stats.risk}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Urban coverage</span>
                  <span>{Math.min(95, 40 + stats.growth * 8).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(95, 40 + stats.growth * 8)} className="h-1.5" />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Select a district to view analytics.</p>
          )}
        </div>

        <TimelineSlider value={year} onChange={onYearChange} minYear={2014} maxYear={2026} />

        <LayerTogglePanel layers={layers} onToggle={onToggleLayer} />
      </div>
    </aside>
  );
}
