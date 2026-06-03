import { Outlet } from "react-router-dom";
import { AdminGuard } from "@/components/auth/admin-guard";

/** Inner layout for /admin/* pages (guard is on AdminShell). */
export function AdminLayout() {
  return (
    <AdminGuard>
      <div className="min-h-full">
        <Outlet />
      </div>
    </AdminGuard>
  );
}
