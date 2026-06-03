import { useState, useCallback, useRef, useEffect } from "react";
import { GisMapLoader } from "@/components/map/map-loader";
import { MapControlPanel } from "@/components/map/map-control-panel";
import { MapToolbar, MapLegend, MapToolsBar } from "@/components/map/map-chrome";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { mapService } from "@/services/api";
import { logEvent } from "@/lib/analytics/log-event";
import type { BasemapType } from "@/components/map/gis-map";

export default function MapPage() {
  useEffect(() => {
    logEvent("map_view");
  }, []);

  const [year, setYear] = useState(2022);
  const [zoom, setZoom] = useState(13);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [basemap, setBasemap] = useState<BasemapType>("dark");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const zoomRef = useRef(setZoom);

  const [layers, setLayers] = useState([
    { id: "districts", name: "District Boundaries", visible: true },
    { id: "built-up", name: "Built-up Areas", visible: true },
    { id: "heatmap", name: "Urban Growth Heatmap", visible: true },
    { id: "population", name: "Population Density", visible: false },
    { id: "land-use", name: "Land Use", visible: false },
    { id: "urban-growth", name: "Urban Growth", visible: true },
    { id: "infrastructure", name: "Infrastructure", visible: false },
    { id: "satellite", name: "Satellite Overlay", visible: false },
  ]);

  const layerMap = Object.fromEntries(layers.map((l) => [l.id, l.visible]));
  const activeLayerIds = layers.filter((l) => l.visible).map((l) => l.id);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
    if (id === "satellite" && !layerMap.satellite) {
      setBasemap("satellite");
    }
    logEvent("layer_toggle", { layer: id });
  };

  const handleCoords = useCallback((c: { lat: number; lng: number }) => {
    setCoords(c);
  }, []);

  const handleExport = async () => {
    const geojson = await mapService.getGeoJSON("districts");
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mug-districts-${year}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    logEvent("geojson_export", { year });
  };

  const handleYearChange = (y: number) => {
    setYear(y);
    logEvent("timeline_play", { year: y });
  };

  const effectiveBasemap: BasemapType = layerMap.satellite ? "satellite" : basemap;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 relative min-w-0 overflow-hidden">
        <GisMapLoader
          year={year}
          basemap={effectiveBasemap}
          showDistricts={layerMap.districts}
          showBuiltUp={layerMap["built-up"]}
          showHeatmap={layerMap.heatmap}
          showPopulationHeatmap={layerMap.population}
          showInfrastructureHeatmap={layerMap.infrastructure}
          showLandUse={layerMap["land-use"]}
          showUrbanGrowth={layerMap["urban-growth"]}
          showInfrastructure={layerMap.infrastructure}
          selectedDistrict={selectedDistrict}
          onZoomChange={(z) => { setZoom(z); zoomRef.current = () => setZoom(z); }}
          onCoordsChange={handleCoords}
        />

        <MapToolbar
          year={year}
          zoom={zoom}
          coords={coords}
          basemap={effectiveBasemap}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen(!fullscreen)}
          onBasemapChange={setBasemap}
          onZoomIn={() => setZoom((z) => Math.min(z + 1, 18))}
          onZoomOut={() => setZoom((z) => Math.max(z - 1, 11))}
        />

        <MapLegend activeLayers={activeLayerIds} />
        <MapToolsBar activeTool={activeTool} onToolChange={setActiveTool} onExport={handleExport} />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-16 right-3 z-[1000] gis-panel h-9 w-9 lg:hidden"
          onClick={() => setPanelOpen(!panelOpen)}
        >
          {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>

      <div
        className={
          panelOpen
            ? "fixed inset-y-0 right-0 z-[1001] lg:relative lg:inset-y-auto flex h-full"
            : "hidden lg:flex h-full"
        }
      >
        {panelOpen && (
          <div
            className="lg:hidden absolute inset-0 -left-[100vw] bg-black/60 backdrop-blur-sm"
            onClick={() => setPanelOpen(false)}
          />
        )}
        <MapControlPanel
          year={year}
          onYearChange={handleYearChange}
          layers={layers}
          onToggleLayer={toggleLayer}
          search={search}
          onSearchChange={setSearch}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
          collapsed={!panelOpen}
        />
      </div>
    </div>
  );
}
