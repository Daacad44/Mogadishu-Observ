import "@/lib/leaflet-setup";
import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet.heat";
import { Loader2 } from "lucide-react";
import { MOGADISHU_CENTER, MOGADISHU_BOUNDS, DISTRICTS } from "@/lib/data/sample-data";
import { mapService } from "@/services/api";

export type BasemapType = "dark" | "streets" | "satellite" | "hybrid" | "terrain";

interface GisMapProps {
  year?: number;
  basemap?: BasemapType;
  showHeatmap?: boolean;
  showPopulationHeatmap?: boolean;
  showInfrastructureHeatmap?: boolean;
  showDistricts?: boolean;
  showBuiltUp?: boolean;
  showLandUse?: boolean;
  showPopulation?: boolean;
  showUrbanGrowth?: boolean;
  showInfrastructure?: boolean;
  selectedDistrict?: string | null;
  onZoomChange?: (zoom: number) => void;
  onCoordsChange?: (coords: { lat: number; lng: number }) => void;
  onBearingChange?: (bearing: number) => void;
  className?: string;
}

const BASEMAPS: Record<BasemapType, { url: string; attribution: string; labels?: string }> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
  },
  hybrid: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
    labels: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenTopoMap',
  },
};

export function GisMap({
  year = 2024,
  basemap = "dark",
  showHeatmap = true,
  showPopulationHeatmap = false,
  showInfrastructureHeatmap = false,
  showDistricts = true,
  showBuiltUp = true,
  showLandUse = false,
  showPopulation = false,
  showUrbanGrowth = true,
  showInfrastructure = false,
  selectedDistrict = null,
  onZoomChange,
  onCoordsChange,
  onBearingChange,
  className = "",
}: GisMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const miniMapInstance = useRef<L.Map | null>(null);
  const basemapRef = useRef<{ base?: L.TileLayer; labels?: L.TileLayer }>({});
  const layersRef = useRef<Record<string, L.Layer | undefined>>({});
  const [ready, setReady] = useState(false);
  const [tilesLoading, setTilesLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const container = mapRef.current;
    const map = L.map(container, {
      center: MOGADISHU_CENTER,
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: MOGADISHU_BOUNDS,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false, metric: true }).addTo(map);

    map.on("mousemove", (e) => {
      onCoordsChange?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    map.on("zoomend", () => onZoomChange?.(map.getZoom()));
    map.on("move", () => onBearingChange?.(0));

    mapInstance.current = map;
    setReady(true);
    onZoomChange?.(map.getZoom());

    // CRITICAL FIX for black/blank map: the container may have 0 / wrong size
    // when Leaflet initializes (lazy load + flex layout). Force it to recompute
    // its dimensions once the DOM has settled and whenever the container resizes.
    const invalidate = () => map.invalidateSize({ animate: false });
    const raf = requestAnimationFrame(invalidate);
    const timers = [
      setTimeout(invalidate, 150),
      setTimeout(invalidate, 500),
      setTimeout(invalidate, 1000),
    ];

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => map.invalidateSize({ animate: false }));
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", invalidate);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", invalidate);
      map.remove();
      mapInstance.current = null;
      basemapRef.current = {};
    };
  }, [onZoomChange, onCoordsChange, onBearingChange]);

  // Mini map
  useEffect(() => {
    if (!miniMapRef.current || miniMapInstance.current || !ready) return;

    const mini = L.map(miniMapRef.current, {
      center: MOGADISHU_CENTER,
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer(BASEMAPS.dark.url, { maxZoom: 19 }).addTo(mini);
    miniMapInstance.current = mini;

    return () => {
      mini.remove();
      miniMapInstance.current = null;
    };
  }, [ready]);

  // Sync main map view to minimap
  useEffect(() => {
    const map = mapInstance.current;
    const mini = miniMapInstance.current;
    if (!map || !mini) return;

    const sync = () => {
      mini.setView(map.getCenter(), Math.max(map.getZoom() - 3, 9));
    };
    map.on("moveend", sync);
    sync();
    return () => { map.off("moveend", sync); };
  }, [ready]);

  // Basemap switch (with loading state + automatic fallback on tile errors)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !ready) return;

    const config = BASEMAPS[basemap];
    if (basemapRef.current.base) map.removeLayer(basemapRef.current.base);
    if (basemapRef.current.labels) map.removeLayer(basemapRef.current.labels);

    setTilesLoading(true);

    const base = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19,
      // Light gray placeholder instead of harsh black while a tile is missing
      errorTileUrl:
        "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23101826'/%3E%3C/svg%3E",
    });

    let fallbackAdded = false;
    let errorCount = 0;
    base.on("load", () => setTilesLoading(false));
    base.on("tileerror", () => {
      errorCount += 1;
      // If the primary provider repeatedly fails, drop in OpenStreetMap so the
      // user never stares at a black screen.
      if (!fallbackAdded && errorCount > 4) {
        fallbackAdded = true;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        setTilesLoading(false);
      }
    });

    base.addTo(map);
    basemapRef.current.base = base;

    // Safety: clear the loader even if the 'load' event is missed
    const t = setTimeout(() => setTilesLoading(false), 3000);

    if (config.labels) {
      basemapRef.current.labels = L.tileLayer(config.labels, {
        maxZoom: 19,
        pane: "overlayPane",
      }).addTo(map);
    }

    return () => clearTimeout(t);
  }, [basemap, ready]);

  const clearLayer = (key: string) => {
    const map = mapInstance.current;
    const layer = layersRef.current[key];
    if (map && layer) {
      map.removeLayer(layer);
      layersRef.current[key] = undefined;
    }
  };

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !ready) return;

    let cancelled = false;

    ["districts", "builtUp", "heatmap", "popHeat", "infraHeat", "landUse"].forEach(clearLayer);

    async function loadLayers() {
      const m = mapInstance.current;
      if (!m) return;

      if (showDistricts) {
        const geojson = await mapService.getGeoJSON("districts");
        if (cancelled || !geojson || !mapInstance.current) return;
        layersRef.current.districts = L.geoJSON(geojson, {
          style: (feature) => {
            const code = feature?.properties?.code;
            const selected = selectedDistrict === code;
            return {
              color: selected ? "#ffffff" : "#00d4aa",
              weight: selected ? 3 : 2,
              fillColor: "#00d4aa",
              fillOpacity: selected ? 0.2 : 0.06,
            };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties;
            layer.bindPopup(
              `<div style="font-family:system-ui;min-width:160px">
                <strong style="color:#00d4aa">${p?.name}</strong><br/>
                <span style="color:#94a3b8;font-size:12px">
                  ${p?.area_km2} km² · Pop. ${p?.population?.toLocaleString()}
                </span>
              </div>`
            );
          },
        }).addTo(mapInstance.current);
      }

      if (showBuiltUp || showUrbanGrowth) {
        const geojson = await mapService.getGeoJSON("built-up", year);
        if (cancelled || !geojson || !mapInstance.current) return;
        layersRef.current.builtUp = L.geoJSON(geojson, {
          style: (f) => ({
            color: "#3b82f6",
            weight: 1,
            fillColor: showUrbanGrowth ? "#00d4aa" : "#3b82f6",
            fillOpacity: (f?.properties?.intensity || 0.5) * 0.45,
          }),
        }).addTo(mapInstance.current);
      }

      if (showLandUse) {
        const geojson = await mapService.getGeoJSON("built-up", year);
        if (cancelled || !geojson || !mapInstance.current) return;
        layersRef.current.landUse = L.geoJSON(geojson, {
          style: (f) => {
            const i = f?.properties?.intensity || 0.5;
            const color = i > 0.7 ? "#00d4aa" : i > 0.4 ? "#3b82f6" : "#78716c";
            return { color, weight: 1, fillColor: color, fillOpacity: 0.5 };
          },
        }).addTo(mapInstance.current);
      }

      const addHeat = async (
        key: string,
        gradient: Record<number, string>,
        enabled: boolean
      ) => {
        if (!enabled) return;
        const heatData = await mapService.getGeoJSON("heatmap", year);
        if (cancelled || !heatData || !mapInstance.current) return;
        const points: [number, number, number][] = heatData.features.map((f) => {
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
          return [lat, lng, f.properties?.intensity || 0.5];
        });
        layersRef.current[key] = L.heatLayer(points, {
          radius: 28,
          blur: 18,
          maxZoom: 17,
          gradient,
        }).addTo(mapInstance.current);
      };

      await addHeat(
        "heatmap",
        { 0.2: "#0a0e17", 0.5: "#1e3a5f", 0.7: "#3b82f6", 0.9: "#00d4aa", 1: "#fff" },
        showHeatmap
      );
      await addHeat(
        "popHeat",
        { 0.2: "#1e1b4b", 0.5: "#6366f1", 0.8: "#a78bfa", 1: "#fff" },
        showPopulationHeatmap || showPopulation
      );
      await addHeat(
        "infraHeat",
        { 0.2: "#422006", 0.5: "#f59e0b", 0.8: "#fbbf24", 1: "#fff" },
        showInfrastructureHeatmap || showInfrastructure
      );
    }

    loadLayers();

    return () => {
      cancelled = true;
    };
  }, [
    year, showHeatmap, showPopulationHeatmap, showInfrastructureHeatmap,
    showDistricts, showBuiltUp, showLandUse, showPopulation, showUrbanGrowth,
    showInfrastructure, selectedDistrict, ready,
  ]);

  const flyToDistrict = useCallback((code: string | null) => {
    const map = mapInstance.current;
    if (!map || !code) return;
    const district = DISTRICTS.find((d) => d.code === code);
    if (district?.centroid?.coordinates) {
      const [lng, lat] = district.centroid.coordinates;
      map.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  }, []);

  useEffect(() => {
    flyToDistrict(selectedDistrict);
  }, [selectedDistrict, flyToDistrict]);

  return (
    <div className={`relative h-full w-full min-h-[300px] ${className}`}>
      <div ref={mapRef} className="absolute inset-0 h-full w-full" />

      {tilesLoading && (
        <div className="pointer-events-none absolute inset-0 z-[998] flex items-center justify-center bg-[#0a0e17]/70 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Loading map tiles…</p>
          </div>
        </div>
      )}

      <div className="minimap-container absolute bottom-20 right-4 z-[999] w-28 h-24 hidden md:block">
        <div ref={miniMapRef} className="h-full w-full" />
      </div>
    </div>
  );
}
