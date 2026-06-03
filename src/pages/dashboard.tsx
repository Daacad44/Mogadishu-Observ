import { useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  GrowthAreaChart,
  DistrictBarChart,
  GrowthRateChart,
} from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatistics } from "@/hooks/use-growth-data";
import { logEvent } from "@/lib/analytics/log-event";
import { formatArea, formatPercent } from "@/utils";
import {
  Layers,
  TrendingUp,
  Map,
  Building2,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useStatistics();

  useEffect(() => {
    logEvent("dashboard_view");
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Urban Growth Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Real-time analytics and growth trends for Mogadishu (2014–2026)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Built-up Area"
          value={formatArea(stats.totalBuiltUpArea)}
          icon={Layers}
        />
        <StatCard
          title="Average Growth Rate"
          value={formatPercent(stats.totalGrowthRate)}
          icon={TrendingUp}
          trend={stats.totalGrowthRate}
        />
        <StatCard
          title="Districts"
          value={stats.districtsCount}
          subtitle="Across Mogadishu"
          icon={Map}
        />
        <StatCard
          title="Building Density"
          value={`${stats.avgDensity}/km²`}
          subtitle="Average across districts"
          icon={Building2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <CardHeader>
            <CardTitle>Built-up Area Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthAreaChart data={stats.yearlyTrend} />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Annual Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthRateChart data={stats.yearlyTrend} />
          </CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle>District Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <DistrictBarChart data={stats.districtComparison} />
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle>District Growth Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">District</th>
                  <th className="text-right py-3 px-4 font-medium">Built-up Area</th>
                  <th className="text-right py-3 px-4 font-medium">Density</th>
                  <th className="text-right py-3 px-4 font-medium">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.districtComparison.map((d) => (
                  <tr
                    key={d.name}
                    className="border-b border-border/50 hover:bg-glass transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{d.name}</td>
                    <td className="py-3 px-4 text-right">{formatArea(d.area)}</td>
                    <td className="py-3 px-4 text-right">{d.density}/km²</td>
                    <td className="py-3 px-4 text-right text-primary">
                      {formatPercent(d.growth)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
