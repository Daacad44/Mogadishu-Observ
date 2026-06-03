import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Satellite,
  Map,
  TrendingUp,
  FileText,
  Info,
  Mail,
  LayoutDashboard,
  Shield,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Upload,
  Layers,
  Brain,
  Users,
  BarChart3,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { canManageUsers, roleLabel } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";

const publicLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/map", label: "GIS Map", icon: Map },
  { to: "/prediction", label: "Predictions", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

const adminNavLinks: { to: string; label: string; icon: typeof Map; end?: boolean }[] = [
  { to: "/dashboard", label: "Analytics Dashboard", icon: LayoutDashboard },
  { to: "/admin", label: "Command Center", icon: Shield, end: true },
  { to: "/admin/upload", label: "Data Upload", icon: Upload },
  { to: "/admin/layers", label: "GIS Layers", icon: Layers },
  { to: "/admin/predictions", label: "Predictions", icon: Brain },
  { to: "/admin/analytics", label: "Analytics Logs", icon: BarChart3 },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
];

interface AppSidebarProps {
  adminMode?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({
  adminMode = false,
  collapsed = false,
  onToggle,
  mobile = false,
  onNavigate,
}: AppSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const showUserManagement = canManageUsers(profile);

  const NavItem = ({
    to,
    label,
    icon: Icon,
    end = false,
  }: {
    to: string;
    label: string;
    icon: typeof Map;
    end?: boolean;
  }) => {
    const active = end
      ? pathname === to
      : to === "/"
        ? pathname === "/"
        : pathname === to || pathname.startsWith(`${to}/`);

    return (
      <Link
        to={to}
        onClick={() => onNavigate?.()}
        title={collapsed ? label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-primary/20 to-accent/10 text-primary shadow-[inset_0_0_0_1px_rgba(0,212,170,0.25)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary shadow-[0_0_8px_rgba(0,212,170,0.6)]" />
        )}
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
          )}
        />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const navLinks: { to: string; label: string; icon: typeof Map; end?: boolean }[] = adminMode
    ? [
        ...adminNavLinks,
        ...(showUserManagement
          ? [{ to: "/admin/users", label: "User Management", icon: Users }]
          : []),
      ]
    : publicLinks;

  return (
    <aside
      className={cn(
        "sidebar-glass flex flex-col h-full transition-all duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]",
        mobile && "w-full"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
          <Satellite className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight truncate">
              {adminMode ? "Admin Console" : "MUG Observatory"}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {adminMode ? "Dashboard" : "Mogadishu · 2014–2026"}
            </p>
          </div>
        )}
        {onToggle && !mobile && (
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors",
              collapsed && "absolute -right-3 top-6 z-10 bg-background border border-glass-border shadow-lg"
            )}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
            {adminMode ? "Administration" : "Platform"}
          </p>
        )}
        {navLinks.map((link) => (
          <NavItem
            key={link.to}
            to={link.to}
            label={link.label}
            icon={link.icon}
            end={link.end ?? link.to === "/dashboard"}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.06] space-y-1">
        {user ? (
          <>
            <Link
              to="/profile"
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/[0.04]",
                pathname === "/profile" && "bg-primary/10 ring-1 ring-primary/20"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/25">
                <User className="h-4 w-4 text-primary" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate text-xs">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </p>
                  {profile?.role && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 mt-0.5 font-mono">
                      {roleLabel(profile.role)}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
                onNavigate?.();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sign Out"}
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}
