import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

interface TimelineSliderProps {
  minYear?: number;
  maxYear?: number;
  value: number;
  onChange: (year: number) => void;
}

export function TimelineSlider({
  minYear = 2014,
  maxYear = 2026,
  value,
  onChange,
}: TimelineSliderProps) {
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      onChange(value >= maxYear ? minYear : value + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [playing, value, minYear, maxYear, onChange]);

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Timeline</span>
          <Badge variant="default">{value}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (playing ? setPlaying(false) : play())}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      <Slider
        min={minYear}
        max={maxYear}
        step={1}
        value={[value]}
        onValueChange={([v]) => {
          setPlaying(false);
          onChange(v);
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}
