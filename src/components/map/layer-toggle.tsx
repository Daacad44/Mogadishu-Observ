import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";

interface LayerToggleProps {
  layers: {
    id: string;
    name: string;
    visible: boolean;
  }[];
  onToggle: (id: string) => void;
}

export function LayerTogglePanel({ layers, onToggle }: LayerToggleProps) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Map Layers</span>
      </div>
      <div className="space-y-2">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center justify-between">
            <Label htmlFor={layer.id} className="text-sm cursor-pointer">
              {layer.name}
            </Label>
            <Switch
              id={layer.id}
              checked={layer.visible}
              onCheckedChange={() => onToggle(layer.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
