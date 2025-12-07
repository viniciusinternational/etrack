import { useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import { hasPermission } from "@/lib/permissions";

export function useProjectPermissions() {
  const { user } = useAuthStore();

  return useMemo(() => {
    if (!user) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
        canManage: false,
      };
    }

    return {
      canCreate: hasPermission(user, 'create_project'),
      canRead: hasPermission(user, 'view_project'),
      canUpdate: hasPermission(user, 'edit_project'),
      canDelete: hasPermission(user, 'delete_project'),
      canExport: hasPermission(user, 'export_project'),
      canManage: hasPermission(user, 'manage_project'),
    };
  }, [user]);
}

