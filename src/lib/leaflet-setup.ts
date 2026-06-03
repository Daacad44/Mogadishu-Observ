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
