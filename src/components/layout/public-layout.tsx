import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";

const FULL_BLEED_ROUTES = ["/map"];

export function PublicLayout() {
  const { pathname } = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.some((r) => pathname.startsWith(r));

  if (isFullBleed) {
    return (
      // Fixed viewport height — gives Leaflet a bounded pixel height to fill
      <div className="h-dvh w-full overflow-hidden flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col pt-16 overflow-x-hidden">
        <div className="flex-1 w-full">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
