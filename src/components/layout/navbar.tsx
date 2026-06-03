import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Map,
  LayoutDashboard,
  TrendingUp,
  FileText,
  Info,
  Mail,
  Menu,
  X,
  Satellite,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/components/providers/auth-provider";
import { canAccessAdminDashboard } from "@/lib/auth/roles";

const baseNavLinks = [
  { href: "/", label: "Home", icon: Satellite },
  { href: "/map", label: "Map", icon: Map },
  { href: "/prediction", label: "Predictions", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();
  const isAdmin = canAccessAdminDashboard(profile);

  const navLinks = isAdmin
    ? [
        ...baseNavLinks.slice(0, 2),
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...baseNavLinks.slice(2),
      ]
    : baseNavLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Satellite className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight">MUG Observatory</p>
            <p className="text-[10px] text-muted-foreground">Mogadishu 2014–2026</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-glass"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <UserMenu />
          <Button variant="default" size="sm" asChild className="hidden sm:flex">
            <Link to="/map">Explore Map</Link>
          </Button>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-glass"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-glass-border bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
