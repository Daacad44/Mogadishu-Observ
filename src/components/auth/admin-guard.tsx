import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { canAccessAdminDashboard } from "@/lib/auth/roles";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !configured) return;
    if (!user) {
      navigate("/login?redirect=/admin", { replace: true });
      return;
    }
    if (profile && !canAccessAdminDashboard(profile)) {
      navigate("/", { replace: true });
    }
  }, [user, profile, loading, configured, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!configured) return <>{children}</>;
  if (!user) return null;
  if (profile && !canAccessAdminDashboard(profile)) return null;

  return <>{children}</>;
}

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !configured) return;
    if (!user) {
      navigate("/login?redirect=/dashboard", { replace: true });
      return;
    }
    if (profile && !canAccessAdminDashboard(profile)) {
      navigate("/", { replace: true });
    }
  }, [user, profile, loading, configured, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!configured) return <>{children}</>;
  if (!user) return null;
  if (profile && !canAccessAdminDashboard(profile)) return null;

  return <>{children}</>;
}
