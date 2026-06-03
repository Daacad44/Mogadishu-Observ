import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, ExternalLink } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { cn } from "@/lib/utils";
import { DashboardGuard } from "@/components/auth/admin-guard";

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardGuard>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        <div className="hidden lg:flex shrink-0 h-full">
          <AppSidebar
            adminMode
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full w-[280px] shadow-2xl">
              <AppSidebar adminMode mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <header className="flex items-center justify-between h-14 px-4 border-b border-glass-border bg-background/95 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold">Admin Dashboard</p>
            </div>
            <Link
              to="/"
              className={cn(
                "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Public Site
            </Link>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
