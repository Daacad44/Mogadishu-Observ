import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { usePredictions, useCreatePrediction } from "@/hooks/use-growth-data";
import { DISTRICTS } from "@/lib/data/sample-data";
import { logEvent } from "@/lib/analytics/log-event";
import { Brain, Target, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

export default function PredictionPage() {
  const { data: predictions, isLoading } = usePredictions();
  const createPrediction = useCreatePrediction();
  const [targetYear, setTargetYear] = useState("2028");
  const [modelType, setModelType] = useState("random_forest");

  useEffect(() => {
    logEvent("prediction_view");
  }, []);

  const handlePredict = () => {
    createPrediction.mutate({
      target_year: parseInt(targetYear),
      model_type: modelType,
    });
  };

  const futurePredictions = predictions?.filter((p) => p.target_year >= 2027) || [];
  const avgConfidence =
    futurePredictions.length > 0
      ? futurePredictions.reduce((s, p) => s + (p.confidence_score || 0), 0) /
        futurePredictions.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Growth Predictions</h1>
        </div>
        <p className="text-muted-foreground">
          Machine learning forecasts for urban expansion in Mogadishu (2027–2030)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Model" value="Random Forest" icon={Brain} />
        <StatCard
          title="Avg Confidence"
          value={`${(avgConfidence * 100).toFixed(1)}%`}
          icon={Target}
        />
        <StatCard
          title="Predictions"
          value={futurePredictions.length}
          subtitle="District forecasts"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card glass className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Year</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              >
                {[2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Model Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
              >
                <option value="random_forest">Random Forest</option>
                <option value="linear_regression">Linear Regression</option>
              </select>
            </div>
            <Button
              className="w-full"
              onClick={handlePredict}
              disabled={createPrediction.isPending}
            >
              {createPrediction.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Run Prediction"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card glass className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Hotspots Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {futurePredictions.slice(0, 20).map((pred) => {
                  const district = DISTRICTS.find(
                    (_, i) => `district-${i}` === pred.district_id
                  );
                  return (
                    <div
                      key={pred.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-glass transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {district?.name || pred.district_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: {pred.target_year} · {pred.model_type}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">
                          {pred.predicted_area_km2} km²
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(pred.confidence_score || 0) * 100}
                            className="w-16 h-1.5"
                          />
                          <Badge variant="success" className="text-[10px]">
                            {((pred.confidence_score || 0) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
