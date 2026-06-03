import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, User, Crown, Loader2 } from "lucide-react";
import { roleLabel } from "@/lib/auth/roles";
import { useProfiles, useUpdateUserRole } from "@/hooks/use-admin-data";
import { useAuth } from "@/components/providers/auth-provider";
import { canManageUsers } from "@/lib/auth/roles";
import { formatDate } from "@/utils";
import type { UserRole } from "@/types";

const roleColors: Record<string, "default" | "secondary" | "success"> = {
  super_admin: "default",
  admin: "default",
  analyst: "success",
  user: "secondary",
};

const ASSIGNABLE_ROLES: UserRole[] = ["user", "analyst", "admin"];

export default function AdminUsersPage() {
  const { profile: currentProfile } = useAuth();
  const { data: users = [], isLoading } = useProfiles();
  const updateRole = useUpdateUserRole();
  const canManage = canManageUsers(currentProfile);

  if (!canManage) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Only super admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage roles from the database. Promote users to admin for dashboard access.
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No users in database yet. Register accounts via the public site.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Joined</th>
                    <th className="text-right py-3 px-4 font-medium">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-glass transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.role === "super_admin" ? (
                              <Crown className="h-4 w-4 text-primary" />
                            ) : user.role === "admin" ? (
                              <Shield className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{user.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={roleColors[user.role]}>
                          {roleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.role === "super_admin" || user.id === currentProfile?.id ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <select
                            className="text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                            value={user.role}
                            disabled={updateRole.isPending}
                            onChange={(e) =>
                              updateRole.mutate({
                                id: user.id,
                                role: e.target.value as UserRole,
                              })
                            }
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {roleLabel(r)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
