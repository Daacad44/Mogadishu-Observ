import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";

const FULL_BLEED_ROUTES = ["/map"];

export function PublicLayout() {
  const { pathname } = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main
        className={cn(
          "flex-1 flex flex-col min-h-0",
          isFullBleed ? "overflow-hidden pt-16" : "pt-16 overflow-x-hidden"
        )}
      >
        <div className={cn("flex-1 w-full", isFullBleed && "min-h-0 h-[calc(100dvh-4rem)]")}>
          <Outlet />
        </div>
        {!isFullBleed && <Footer />}
      </main>
    </div>
  );
}
