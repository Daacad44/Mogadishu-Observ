// Leaflet global setup — MUST be imported before "leaflet.heat".
//
// `leaflet.heat` is an old UMD plugin that references a GLOBAL `L` (it does
// `L.heatLayer = ...`). Vite/ESM only gives `L` a local module binding, so in
// the production bundle the global is missing and the plugin throws
//   "Uncaught ReferenceError: L is not defined"
// which kills map rendering (black screen). Exposing L on the global object
// before the plugin loads fixes this.
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const g = globalThis as unknown as { L?: typeof L };
if (!g.L) {
  g.L = L;
}

// Patch canvas for leaflet.heat — avoids getImageData performance warning
{
  const original = HTMLCanvasElement.prototype.getContext.bind(
    HTMLCanvasElement.prototype
  );

  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    options?: CanvasRenderingContext2DSettings
  ) {
    if (contextId === "2d") {
      return original(contextId, {
        ...options,
        willReadFrequently: true,
      }) as CanvasRenderingContext2D | null;
    }
    return original(contextId, options as never);
  } as typeof HTMLCanvasElement.prototype.getContext;
}

export default L;
