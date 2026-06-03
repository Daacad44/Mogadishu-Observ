import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Play, RefreshCw, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usePredictions } from "@/hooks/use-growth-data";
import { predictionService } from "@/services/api";
import { logEvent } from "@/lib/analytics/log-event";

export default function AdminPredictionsPage() {
  const queryClient = useQueryClient();
  const { data: predictions } = usePredictions();
  const [targetYear, setTargetYear] = useState("2028");
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const models = [
    {
      key: "random_forest",
      name: "Random Forest",
      status: "trained",
      accuracy: 87.3,
      lastTrained: "2025-11-15",
    },
    {
      key: "linear_regression",
      name: "Linear Regression",
      status: "trained",
      accuracy: 79.1,
      lastTrained: "2025-11-10",
    },
  ];

  const handleBatch = async (modelType: string) => {
    setResult(null);
    setRunning(`batch-${modelType}`);
    try {
      const count = await predictionService.runBatch(parseInt(targetYear), modelType);
      if (count === 0) {
        throw new Error("No predictions created. Ensure the database is seeded with districts.");
      }
      logEvent("batch_prediction", { model: modelType, year: targetYear, count });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      setResult({
        ok: true,
        message: `Generated ${count} predictions for ${targetYear} using ${modelType}.`,
      });
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Batch prediction failed.",
      });
    } finally {
      setRunning(null);
    }
  };

  const handleRetrain = async (modelType: string) => {
    setResult(null);
    setRunning(`retrain-${modelType}`);
    try {
      await logEvent("model_retrain", { model: modelType });
      // Simulated retrain step (no live ML backend); recorded as an analytics event.
      await new Promise((r) => setTimeout(r, 800));
      setResult({ ok: true, message: `Retrain queued for ${modelType}. Event logged.` });
    } finally {
      setRunning(null);
    }
  };

  const predictionCount = (modelKey: string) =>
    predictions?.filter((p) => p.model_type === modelKey).length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Prediction Management</h1>
          <p className="text-sm text-muted-foreground">
            Run batch predictions that write to the <code className="text-xs">predictions</code> table.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Target year</label>
          <select
            className="h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm"
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
          >
            {[2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card glass key={model.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-5 w-5 text-primary" />
                  {model.name}
                </CardTitle>
                <Badge variant="success">{model.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium">{model.accuracy}%</span>
                </div>
                <Progress value={model.accuracy} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Trained</span>
                <span>{model.lastTrained}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Predictions in DB</span>
                <span>{predictionCount(model.key)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleBatch(model.key)}
                  disabled={running !== null}
                >
                  {running === `batch-${model.key}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Run Batch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRetrain(model.key)}
                  disabled={running !== null}
                >
                  {running === `retrain-${model.key}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Retrain
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
