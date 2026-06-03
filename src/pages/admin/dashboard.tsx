import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Layers,
  FileText,
  Activity,
  Database,
  Brain,
  Loader2,
} from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin-data";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/api";
import { formatDate } from "@/utils";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["analytics-logs"],
    queryFn: () => profileService.getAnalyticsLogs(8),
  });

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          System overview — data loaded from Supabase
        </p>
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats?.users ?? 0} icon={Users} />
          <StatCard title="GIS Layers" value={stats?.layers ?? 0} icon={Layers} />
          <StatCard title="Reports" value={stats?.reports ?? 0} icon={FileText} />
          <StatCard title="Predictions" value={stats?.predictions ?? 0} icon={Brain} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No analytics logs yet. Events are stored in the{" "}
                <code className="text-xs">analytics_logs</code> table.
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.event_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      log
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Connection</span>
              <Badge variant="success">Supabase</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Tables</span>
              <span>8 tables</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Districts seeded</span>
              <span>10 districts</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Growth data</span>
              <span>2014–2026</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
