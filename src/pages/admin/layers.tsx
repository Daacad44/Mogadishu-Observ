import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Layers, Eye, EyeOff, Loader2 } from "lucide-react";
import { useGisLayers, useToggleGisLayer } from "@/hooks/use-admin-data";

export default function AdminLayersPage() {
  const { data: layers = [], isLoading } = useGisLayers();
  const toggleLayer = useToggleGisLayer();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Layers</h1>
        <p className="text-sm text-muted-foreground">
          GIS layers stored in the <code className="text-xs">gis_layers</code> database table.
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Active Layers ({layers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-glass transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {layer.is_visible ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{layer.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {layer.layer_type}
                        </Badge>
                        {layer.year && (
                          <span className="text-[10px] text-muted-foreground">{layer.year}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">{layer.slug}</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={layer.is_visible}
                    disabled={toggleLayer.isPending}
                    onCheckedChange={(checked) =>
                      toggleLayer.mutate({ id: layer.id, is_visible: checked })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
