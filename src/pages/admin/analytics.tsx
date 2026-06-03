import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Eye, Download, Map, Loader2, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { analyticsService } from "@/services/api";
import { formatDate } from "@/utils";

const eventIcons: Record<string, typeof Eye> = {
  map_view: Map,
  dashboard_view: BarChart3,
  report_download: Download,
  prediction_view: Eye,
  layer_toggle: Map,
  timeline_play: Eye,
  geojson_export: Download,
};

function prettyEvent(event: string) {
  return event.replace(/_/g, " ");
}

export default function AdminAnalyticsPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsService.getSummary(),
  });

  const total = summary?.total ?? 0;
  const uniqueSessions = summary?.uniqueSessions ?? 0;
  const byEvent = summary?.byEvent ?? [];
  const maxCount = byEvent[0]?.count ?? 1;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Management</h1>
        <p className="text-sm text-muted-foreground">
          Live platform usage from the <code className="text-xs">analytics_logs</code> table
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Events" value={total.toLocaleString()} icon={BarChart3} />
            <StatCard title="Unique Sessions" value={uniqueSessions.toLocaleString()} icon={Eye} />
            <StatCard title="Event Types" value={byEvent.length} icon={Activity} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card glass>
              <CardHeader>
                <CardTitle>Event Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {byEvent.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No events recorded yet. Browse the public site (map, reports,
                    predictions) to generate analytics.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {byEvent.map((item) => {
                      const Icon = eventIcons[item.event_type] || Eye;
                      return (
                        <div key={item.event_type} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium capitalize">
                                {prettyEvent(item.event_type)}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground tabular-nums">
                              {item.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                              style={{ width: `${(item.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!summary?.recent.length ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No recent activity.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {summary.recent.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <span className="text-sm capitalize">{prettyEvent(log.event_type)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
