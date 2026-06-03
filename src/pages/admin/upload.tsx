import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { uploadService } from "@/services/api";
import { logEvent } from "@/lib/analytics/log-event";
import { slugify } from "@/utils";
import type { LayerType } from "@/types";

export default function AdminUploadPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [layerType, setLayerType] = useState<LayerType>("vector");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const reset = () => {
    setName("");
    setYear("");
    setLayerType("vector");
    setFile(null);
  };

  const handleImport = async () => {
    setResult(null);

    if (!name.trim()) {
      setResult({ ok: false, message: "Please enter a dataset name." });
      return;
    }
    if (!file) {
      setResult({ ok: false, message: "Please choose a GeoJSON file to import." });
      return;
    }

    setSaving(true);
    try {
      let geojson: GeoJSON.FeatureCollection | null = null;

      if (/\.(geojson|json)$/i.test(file.name)) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed?.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
          throw new Error("File is not a valid GeoJSON FeatureCollection.");
        }
        geojson = parsed as GeoJSON.FeatureCollection;
      }

      const layer = await uploadService.createLayer({
        name: name.trim(),
        slug: slugify(name),
        description: `Uploaded ${file.name}`,
        layer_type: layerType,
        year: year ? parseInt(year) : null,
        geojson,
      });

      if (!layer) {
        throw new Error(
          "Could not save layer. Ensure Supabase is configured and you have admin access."
        );
      }

      logEvent("layer_upload", { name: name.trim(), type: layerType });
      queryClient.invalidateQueries({ queryKey: ["gis-layers"] });
      setResult({
        ok: true,
        message: geojson
          ? `Imported "${layer.name}" with ${geojson.features.length} features.`
          : `Created layer "${layer.name}" (no GeoJSON parsed — non-JSON file).`,
      });
      reset();
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Upload failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload GIS Datasets</h1>
        <p className="text-sm text-muted-foreground">
          Import a GeoJSON FeatureCollection into the{" "}
          <code className="text-xs">gis_layers</code> database table.
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            New Layer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Dataset Name</Label>
            <Input
              placeholder="e.g. Mogadishu Buildings 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {name && (
              <p className="text-[11px] text-muted-foreground font-mono">
                slug: {slugify(name)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Year (optional)</Label>
            <Input
              type="number"
              placeholder="2024"
              min={2014}
              max={2030}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Layer Type</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
              value={layerType}
              onChange={(e) => setLayerType(e.target.value as LayerType)}
            >
              <option value="vector">Vector (GeoJSON)</option>
              <option value="raster">Raster</option>
              <option value="heatmap">Heatmap</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
            <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Select a GeoJSON file (.geojson, .json)
            </p>
            <Input
              type="file"
              accept=".geojson,.json"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="max-w-xs mx-auto"
            />
            {file && (
              <p className="mt-3 text-xs text-primary">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                result.ok
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {result.ok ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              {result.message}
            </div>
          )}

          <Button onClick={handleImport} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import to Database"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
