import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageLoader } from "@/components/ui/page-loader";
import { routes, adminRoutes } from "@/routes";

const DashboardPage = lazy(() => import("@/pages/dashboard"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public web experience — top navbar for all visitors and regular users */}
        <Route element={<PublicLayout />}>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Admin & super_admin dashboard — separate sidebar shell */}
        <Route element={<AdminShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path={adminRoutes.path} element={<AdminLayout />}>
            {adminRoutes.children?.map((child) => (
              <Route
                key={child.path || "index"}
                path={child.path}
                index={child.index}
                element={child.element}
              />
            ))}
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
