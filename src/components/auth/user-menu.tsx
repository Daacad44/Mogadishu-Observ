import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Shield, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { canAccessAdminDashboard, canManageUsers, roleLabel } from "@/lib/auth/roles";

export function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="hidden sm:block h-9 w-32 rounded-lg bg-secondary/50 animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button variant="default" size="sm" asChild className="shadow-sm">
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const isAdmin = canAccessAdminDashboard(profile);
  const isSuperAdmin = canManageUsers(profile);

  return (
    <div className="hidden sm:flex items-center gap-2">
      <Link
        to="/profile"
        className="flex items-center gap-2 rounded-lg border border-glass-border bg-glass px-3 py-1.5 hover:border-primary/40 transition-colors"
        title="Profile"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="text-left leading-tight">
          <p className="text-xs font-medium max-w-[100px] truncate">{displayName}</p>
          {profile?.role && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              {roleLabel(profile.role)}
            </Badge>
          )}
        </div>
      </Link>
      {isAdmin && (
        <Button variant="ghost" size="sm" asChild title="Analytics Dashboard">
          <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /></Link>
        </Button>
      )}
      {isSuperAdmin && (
        <Button variant="ghost" size="sm" asChild title="Command Center">
          <Link to="/admin"><Shield className="h-4 w-4" /></Link>
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" title="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
