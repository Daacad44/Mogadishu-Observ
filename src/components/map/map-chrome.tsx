import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Maximize2,
  Minimize2,
  MapPin,
  Satellite,
  Compass,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { BasemapType } from "@/components/map/gis-map";

interface MapToolbarProps {
  year: number;
  zoom: number;
  coords: { lat: number; lng: number } | null;
  basemap: BasemapType;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onBasemapChange: (b: BasemapType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const BASEMAP_OPTIONS: { id: BasemapType; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "streets", label: "Streets" },
  { id: "satellite", label: "Satellite" },
  { id: "hybrid", label: "Hybrid" },
  { id: "terrain", label: "Terrain" },
];

export function MapToolbar({
  year,
  zoom,
  coords,
  basemap,
  fullscreen,
  onToggleFullscreen,
  onBasemapChange,
  onZoomIn,
  onZoomOut,
}: MapToolbarProps) {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-start justify-between gap-2 px-3 sm:px-4 py-3 bg-gradient-to-b from-background/95 via-background/70 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="gis-panel px-3 sm:px-4 py-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold leading-none">Smart City GIS Center</p>
              <p className="text-[10px] text-muted-foreground hidden sm:block">Mogadishu Urban Growth</p>
            </div>
          </div>
          <Badge variant="default" className="text-xs px-2.5 py-1 font-mono">{year}</Badge>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {coords && (
            <div className="hidden sm:flex gis-panel px-3 py-1.5 text-[11px] font-mono text-muted-foreground items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
            </div>
          )}
          <div className="hidden md:flex gis-panel px-2.5 py-1.5 text-[11px] text-muted-foreground font-mono">
            Z{zoom}
          </div>
          <Button variant="ghost" size="icon" className="gis-panel h-8 w-8" onClick={onToggleFullscreen}>
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Left control stack */}
      <div className="absolute top-20 left-3 sm:left-4 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <Button variant="ghost" size="icon" className="gis-panel h-8 w-8" onClick={onZoomIn} aria-label="Zoom in">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="gis-panel h-8 w-8" onClick={onZoomOut} aria-label="Zoom out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <div className="gis-panel h-8 w-8 flex items-center justify-center">
          <Compass className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Basemap switcher */}
      <div className="absolute top-20 left-14 sm:left-16 z-[1000] pointer-events-auto hidden sm:flex gap-1">
        {BASEMAP_OPTIONS.map((b) => (
          <button
            key={b.id}
            onClick={() => onBasemapChange(b.id)}
            className={`gis-panel px-2 py-1 text-[10px] font-medium transition-colors ${
              basemap === b.id ? "text-primary border-primary/40" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </>
  );
}

interface MapLegendProps {
  activeLayers: string[];
}

export function MapLegend({ activeLayers }: MapLegendProps) {
  const items = [
    { color: "#00d4aa", label: "District boundaries", id: "districts" },
    { color: "#3b82f6", label: "Built-up areas", id: "built-up" },
    { color: "gradient", label: "Urban growth heatmap", id: "heatmap" },
    { color: "#6366f1", label: "Population density", id: "population" },
    { color: "#f59e0b", label: "Infrastructure", id: "infrastructure" },
  ].filter((i) => activeLayers.includes(i.id) || activeLayers.length === 0);

  return (
    <div className="absolute bottom-4 left-3 sm:left-4 z-[1000] gis-panel p-3 sm:p-4 max-w-[220px]">
      <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
        <Satellite className="h-3.5 w-3.5 text-primary" />
        Map Legend
      </p>
      <div className="space-y-2 text-[11px]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.color === "gradient" ? (
              <div className="h-2.5 w-6 rounded-sm bg-gradient-to-r from-[#0a0e17] via-[#3b82f6] to-[#00d4aa]" />
            ) : (
              <div className="h-2.5 w-2.5 rounded-sm border" style={{ backgroundColor: `${item.color}60`, borderColor: item.color }} />
            )}
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapToolsBar({
  activeTool,
  onToolChange,
  onExport,
}: {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  onExport: () => void;
}) {
  const tools = [
    { id: "distance", label: "Distance" },
    { id: "area", label: "Area" },
    { id: "polygon", label: "Polygon" },
    { id: "marker", label: "Marker" },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] gis-panel px-2 py-1.5 flex items-center gap-1 pointer-events-auto max-w-[calc(100%-2rem)] overflow-x-auto">
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => onToolChange(activeTool === t.id ? null : t.id)}
          className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors ${
            activeTool === t.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          {t.label}
        </button>
      ))}
      <span className="h-4 w-px bg-border mx-1 shrink-0" />
      <button
        onClick={onExport}
        className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-medium text-accent hover:bg-accent/10 whitespace-nowrap"
      >
        Export GeoJSON
      </button>
    </div>
  );
}
