import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import type { BasemapType } from "./gis-map";

const GisMap = lazy(() =>
  import("./gis-map").then((m) => ({ default: m.GisMap }))
);

interface GisMapLoaderProps {
  year?: number;
  basemap?: BasemapType;
  showHeatmap?: boolean;
  showPopulationHeatmap?: boolean;
  showInfrastructureHeatmap?: boolean;
  showDistricts?: boolean;
  showBuiltUp?: boolean;
  showLandUse?: boolean;
  showUrbanGrowth?: boolean;
  showInfrastructure?: boolean;
  selectedDistrict?: string | null;
  onZoomChange?: (zoom: number) => void;
  onCoordsChange?: (coords: { lat: number; lng: number }) => void;
}

export function GisMapLoader(props: GisMapLoaderProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <GisMap {...props} />
    </Suspense>
  );
}
